import { inject, type App, type InjectionKey } from 'vue'
import { PlumisePay, type PaymentConfig } from '@plumise/pay'

export const PlumisePayKey: InjectionKey<PlumisePay> = Symbol('PlumisePay')

export const PlumisePayPlugin = {
  install(app: App, config?: PaymentConfig) {
    const pay = new PlumisePay(config)
    app.provide(PlumisePayKey, pay)
    app.config.globalProperties.$plumisePay = pay
  },
}

export function usePlumisePay(): PlumisePay {
  const pay = inject(PlumisePayKey)
  if (!pay) throw new Error('PlumisePay plugin is not installed. Call app.use(PlumisePayPlugin)')
  return pay
}
