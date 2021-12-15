import ReactDOMServer from 'react-dom/server'
import { App } from '../client/App'
import { data } from './index';

export function renderMe() {
  return ReactDOMServer.renderToString(
      <App {...data} />
  )
}