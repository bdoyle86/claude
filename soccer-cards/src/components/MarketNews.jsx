function MarketNews({ events }) {
  if (!events || events.length === 0) return null;

  return (
    <div className="market-news">
      <div className="market-news-header">
        <span className="news-icon">📰</span>
        <span className="news-title">BREAKING NEWS</span>
      </div>
      <div className="news-ticker">
        {events.map((event, index) => (
          <div key={index} className="news-item">
            <span className="news-item-icon">{event.icon}</span>
            <span className="news-item-title">{event.title}</span>
            <span className="news-item-desc">{event.description}</span>
            <span className="news-item-duration">({event.duration} actions left)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MarketNews;
