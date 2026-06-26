import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './NotFound.css';

export default function NotFound() {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const labels =
    lang === 'ru'
      ? {
          code: '404',
          title: 'Страница не найдена',
          subtitle: 'Возможно, ссылка устарела или страница была перемещена.',
          back: 'Вернуться на главную',
        }
      : {
          code: '404',
          title: 'הדף לא נמצא',
          subtitle: 'יכול להיות שהקישור לא מעודכן או שהדף עבר למקום אחר.',
          back: 'חזרה לדף הבית',
        };

  return (
    <div className="notfound-page container-narrow">
      <div className="notfound-card">
        <div className="notfound-code">{labels.code}</div>
        <h1>{labels.title}</h1>
        <p>{labels.subtitle}</p>
        <Link to="/" className="btn btn-primary">
          {labels.back}
        </Link>
      </div>
    </div>
  );
}
