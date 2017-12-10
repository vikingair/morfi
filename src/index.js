import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './styles/css/bootstrap.css';
import './styles/css/bootstrap-theme.css';
import App from './js/App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
