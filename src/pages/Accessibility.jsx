import InfoPage from './InfoPage.jsx';
import { useTranslation } from 'react-i18next';

export default function Accessibility() {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <InfoPage
      tagKey="accessibility.tag"
      titleKey="accessibility.title"
      updatedKey="accessibility.updated"
    >
      {lang === 'ru' ? <ContentRu /> : <ContentHe />}
    </InfoPage>
  );
}

function ContentHe() {
  return (
    <>
      <h2>המחויבות שלנו לנגישות</h2>
      <p>
        אנו מחויבים לאפשר לכל אדם, ללא קשר ליכולותיו, לעשות שימוש מלא בשירותים ובמידע המוצעים באתר.
        הצהרה זו מתארת את הצעדים שננקטו כדי להבטיח שהאתר נגיש לבעלי מוגבלויות, בהתאם לתקן הישראלי 5568
        ולתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג-2013.
      </p>

      <div className="standard-box">
        <strong>רמת הנגישות באתר זה: AA (לפי WCAG 2.1)</strong>
        <p style={{ margin: '8px 0 0' }}>האתר נבדק ועומד בדרישות של תקן הנגישות הישראלי לאתרי אינטרנט.</p>
      </div>

      <h2>מה הותאם באתר</h2>
      <ul>
        <li><strong>ניווט במקלדת:</strong> ניתן לנווט בכל האתר באמצעות מקלדת בלבד (Tab, Enter, Esc).</li>
        <li><strong>ניגודיות צבעים:</strong> כל הטקסטים באתר עומדים ביחס ניגודיות של 4.5:1 לפחות.</li>
        <li><strong>גודל טקסט:</strong> ניתן להגדיל את גודל הטקסט באתר עד 200% מבלי לפגוע בתפקוד.</li>
        <li><strong>מבנה סמנטי:</strong> האתר בנוי עם תגיות HTML סמנטיות שמאפשרות לקוראי מסך לזהות מבנה הדף בקלות.</li>
        <li><strong>טפסים נגישים:</strong> כל שדות הטופס מסומנים בתוויות ברורות והודעות שגיאה מובנות.</li>
        <li><strong>מבנה כותרות תקין:</strong> היררכיית כותרות הגיונית (H1, H2, H3) שמקלה על קוראי מסך.</li>
        <li><strong>תמיכה בקוראי מסך:</strong> האתר נבדק עם NVDA ו-JAWS.</li>
        <li><strong>תמיכה ב-2 שפות:</strong> האתר זמין בעברית וברוסית עם מעבר נוח בין השפות.</li>
      </ul>

      <h2>פנייה לרכז הנגישות</h2>
      <p>אם נתקלת בקושי בשימוש באתר, או שיש לך הצעות לשיפור, אנא פנה אלינו. נשתדל להגיב בתוך 7 ימי עסקים.</p>
      <div className="contact-box">
        <strong>רכז נגישות</strong>
        שם: שלמה אדיב<br />
        אימייל: nevesagiv@outlook.com
      </div>
    </>
  );
}

function ContentRu() {
  return (
    <>
      <h2>Наше обязательство по доступности</h2>
      <p>
        Мы стремимся обеспечить полный доступ к услугам и информации на нашем сайте для всех пользователей, независимо от их возможностей.
        Этот сайт соответствует Израильскому стандарту 5568 и требованиям WCAG 2.1 уровня AA.
      </p>

      <div className="standard-box">
        <strong>Уровень доступности: AA (WCAG 2.1)</strong>
      </div>

      <h2>Что было адаптировано</h2>
      <ul>
        <li><strong>Навигация с клавиатуры:</strong> весь сайт можно использовать с клавиатуры.</li>
        <li><strong>Цветовой контраст:</strong> все тексты соответствуют соотношению контраста минимум 4.5:1.</li>
        <li><strong>Поддержка экранных читалок:</strong> сайт протестирован с NVDA и JAWS.</li>
        <li><strong>Адаптивный дизайн:</strong> работает на мобильных устройствах и планшетах.</li>
        <li><strong>Поддержка двух языков:</strong> сайт доступен на иврите и русском.</li>
      </ul>

      <h2>Контакты координатора доступности</h2>
      <div className="contact-box">
        <strong>Координатор доступности</strong>
        Имя: Шломо Адив<br />
        Email: nevesagiv@outlook.com
      </div>
    </>
  );
}
