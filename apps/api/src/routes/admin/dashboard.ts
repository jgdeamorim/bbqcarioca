import { Hono } from 'hono';
import { Env } from '../../index';

const dashboard = new Hono<{ Bindings: Env }>();

dashboard.get('/', async (c) => {
  try {
    const db = c.env.DB;
    
    // Batch queries for KPIs
    const results = await db.batch([
      db.prepare("SELECT COUNT(*) as count FROM events WHERE status = 'BOOKED'"),
      db.prepare("SELECT COUNT(*) as count FROM service_requests WHERE status = 'NEW'"),
      db.prepare("SELECT COUNT(*) as count FROM talent_profiles WHERE status = 'NEW'"),
      db.prepare(`
        SELECT 
          id, 
          status as staffing_status, 
          scheduled_start as date
        FROM events 
        WHERE status IN ('BOOKED', 'QUOTED') 
        ORDER BY scheduled_start ASC 
        LIMIT 5
      `)
    ]);

    const upcomingEventsCount = (results[0].results[0] as any)?.count || 0;
    const pendingQuotesCount = (results[1].results[0] as any)?.count || 0;
    const availableStaffCount = (results[2].results[0] as any)?.count || 0;
    const upcomingScheduleRaw = results[3].results || [];

    const payload = {
      kpis: {
        upcoming_events: upcomingEventsCount,
        pending_quotes: pendingQuotesCount,
        available_staff: availableStaffCount,
      },
      upcoming_schedule: upcomingScheduleRaw.length > 0 ? upcomingScheduleRaw : [
        // Fallback mock data if DB is empty to keep UI looking good during dev
        {
          id: 'evt_1',
          title: 'Corporate BBQ Catering',
          location: 'Miami, FL',
          guests: 150,
          date: 'Aug 24',
          staffing_status: 'FULLY_STAFFED'
        },
        {
          id: 'evt_2',
          title: 'Wedding Rehearsal Dinner',
          location: 'Orlando, FL',
          guests: 50,
          date: 'Aug 26',
          staffing_status: 'STAFFING_PENDING'
        }
      ]
    };

    return c.json(payload);
  } catch (e: unknown) {
    void e;
    return c.text('Internal Server Error', 500);
  }
});

export default dashboard;
