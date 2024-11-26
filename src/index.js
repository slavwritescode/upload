import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './Redux/Store';

import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

/*
Swal.fire({
  title: 'Maintenance',
  html: 'The app is not available currently. <br/>Please try to check it again <b>4 hours later</b>. <br/>Thank you!'
})
*/

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <StrictMode>
        <App />
      </StrictMode>
    </BrowserRouter>
  </Provider>
);
