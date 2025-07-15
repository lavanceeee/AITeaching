import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'


// MSW an-able
async function enableMocking() {
  // Use Vite's import.meta.env.DEV to check for development environment
  // Corrected logic: Disable if NOT in dev OR if the mock flag is explicitly false.
  if (!import.meta.env.DEV || import.meta.env.VITE_USE_MOCK === 'false') {
    return
  }
 
  // Dynamically import the MSW worker
  const { worker } = await import('./mocks/browser')
 
  // Start the worker. It returns a Promise.
  // We recommend calling this function without `await`
  // for a non-blocking start of your application.
  return worker.start({
    onUnhandledRequest: 'bypass', // All unhandled requests will pass through
  });
}

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus)


// Start mocking, then mount the application.
enableMocking().then(() => {
  app.mount('#app')
})


