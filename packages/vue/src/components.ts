import { defineComponent, h, type PropType } from 'vue'
import type { PaymentRequest } from '@plumise/pay'
import { usePayment } from './composables'

export const PayButton = defineComponent({
  name: 'PayButton',
  props: {
    request: { type: Object as PropType<PaymentRequest>, required: true },
    disabled: { type: Boolean, default: false },
  },
  emits: ['success', 'cancel', 'error'],
  setup(props, { emit, slots }) {
    const { requestPayment, status } = usePayment()

    const handleClick = async () => {
      const result = await requestPayment(props.request)
      if (result.status === 'confirmed') emit('success', result)
      else if (result.status === 'cancelled') emit('cancel')
      else if (result.status === 'error') emit('error', result.error)
    }

    return () => {
      const isLoading = !['idle', 'confirmed', 'cancelled', 'error', 'expired'].includes(status.value)

      return h(
        'button',
        {
          onClick: handleClick,
          disabled: props.disabled || isLoading,
          style: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0891b2, #7c3aed)',
            color: '#fff',
            fontSize: '15px',
            fontWeight: '600',
            cursor: isLoading || props.disabled ? 'not-allowed' : 'pointer',
            opacity: isLoading || props.disabled ? '0.6' : '1',
            transition: 'opacity 0.2s',
          },
        },
        slots.default?.() || [
          h(
            'svg',
            {
              width: '18',
              height: '18',
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              'stroke-width': '2',
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round',
            },
            [
              h('path', { d: 'M12 2L2 7l10 5 10-5-10-5z' }),
              h('path', { d: 'M2 17l10 5 10-5' }),
              h('path', { d: 'M2 12l10 5 10-5' }),
            ],
          ),
          isLoading ? 'Processing...' : 'Pay with PLM',
        ],
      )
    }
  },
})
