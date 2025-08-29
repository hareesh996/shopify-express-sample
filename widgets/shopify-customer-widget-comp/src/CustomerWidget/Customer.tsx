import './Customer.css';

declare global {
  interface Window {
    shopify: {
      customer?: {
        email?: string;
      };
    };
  }
}

function CustomerWidget() {

  const customer = window.shopify?.customer ;
  if (!customer) {
    return (
      <div className="App">
        <header className="App-header">
          <p>
            No customer data available.
          </p>
        </header>
      </div>
    );
  }

  const handleButtonClick = () => {
    const url = `/apps/custom-apis/test`;
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': "true", // This header is used to skip the ngrok browser warning
        'User-Agent': 'Shopify Customer Widget',
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Response from app proxy:', data);
      alert(`Response from app proxy: ${JSON.stringify(data)}`);
    })
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Welcome, {customer.email}!
        </p>
        <button className='app-button' onClick={handleButtonClick} > Test App Proxy Apis </button>
      </header>
    </div>
  );
}

export default CustomerWidget;
