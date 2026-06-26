import { useEffect, useState } from 'react';
import './RecentActivityBar.css';

const ACTIVITY_FEED = [
  { name: 'דני', from: 'בני ברק', verb: 'התעניין בנכס', city: 'תל אביב', time: '12 דקות' },
  { name: 'מאיר', from: 'חיפה', verb: 'בדק דירה', city: 'נהריה', time: '24 דקות' },
  { name: 'יעל', from: 'ירושלים', verb: 'השאירה פרטים על נכס', city: 'באר שבע', time: '38 דקות' },
  { name: 'אבי', from: 'ראשון לציון', verb: 'התעניין בנכס', city: 'תל אביב', time: 'שעה' },
  { name: 'מירב', from: 'הרצליה', verb: 'בדקה דירה', city: 'נתניה', time: 'שעה וחצי' },
  { name: 'רונן', from: 'אשקלון', verb: 'השאיר פרטים על נכס', city: 'אשדוד', time: '2 שעות' },
  { name: 'נועה', from: 'מודיעין', verb: 'התעניינה בנכס', city: 'תל אביב', time: '3 שעות' },
  { name: 'יוסי', from: 'פתח תקווה', verb: 'בדק דירה', city: 'חיפה', time: '4 שעות' },
  { name: 'שירה', from: 'רעננה', verb: 'השאירה פרטים על נכס', city: 'נצרת', time: '5 שעות' },
  { name: 'איציק', from: 'אילת', verb: 'התעניין בנכס', city: 'באר שבע', time: '6 שעות' },
];

export default function RecentActivityBar() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      const timeout = setTimeout(() => {
        setIndex((i) => (i + 1) % ACTIVITY_FEED.length);
        setFading(false);
      }, 380);
      return () => clearTimeout(timeout);
    }, 4800);
    return () => clearInterval(interval);
  }, []);

  const item = ACTIVITY_FEED[index];

  return (
    <div className="activity-bar" role="status" aria-live="polite" dir="rtl">
      <div className="activity-bar-inner">
        <span className="activity-bar-pulse" aria-hidden="true">
          <span className="activity-bar-pulse-dot" />
        </span>
        <span className="activity-bar-live">פעילות חיה</span>
        <span className={`activity-bar-text ${fading ? 'is-fading' : ''}`}>
          <strong>{item.name}</strong> מ-{item.from} {item.verb} ב-{item.city}
          <span className="activity-bar-time">  •  לפני {item.time}</span>
        </span>
      </div>
    </div>
  );
}
