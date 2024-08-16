import { Bot, BotProps } from '@/components/Bot'
import { CommandData } from '@/features/commands/types'
import { createSignal, onCleanup, onMount, Show, splitProps } from 'solid-js'
import { EnvironmentProvider } from '@ark-ui/solid'

const hostElementCss = `
:host {
  display: block;
  width: 100%;
  height: 100%;
  overflow-y: hidden;
}
`

export type StandardProps = BotProps & {
  styles?: Promise<string>
}

export const Standard = (
  props: StandardProps,
  { element }: { element: HTMLElement }
) => {
  const [standardProps, botProps] = splitProps(props, ['styles'])

  const [isBotDisplayed, setIsBotDisplayed] = createSignal(false)

  const launchBot = () => {
    setIsBotDisplayed(true)
  }

  const botLauncherObserver = new IntersectionObserver((intersections) => {
    if (intersections.some((intersection) => intersection.isIntersecting))
      launchBot()
  })

  const [styles, setStyles] = createSignal('')

  onMount(() => {
    botLauncherObserver.observe(element)
    ;(standardProps.styles ?? import('../../../assets/index.css')).then((css) =>
      setStyles(css.default ?? css)
    )
  })

  onCleanup(() => {
    botLauncherObserver.disconnect()
  })

  const processIncomingEvent = (event: MessageEvent<CommandData>) => {
    const { data } = event
    if (!data.isFromTypebot) return
  }

  onMount(() => {
    window.addEventListener('message', processIncomingEvent)
  })

  onCleanup(() => {
    window.removeEventListener('message', processIncomingEvent)
  })

  return (
    <EnvironmentProvider
      value={document.querySelector('typebot-standard')?.shadowRoot as Node}
    >
      <style>
        {styles()}
        {!standardProps.styles && hostElementCss}
      </style>
      <Show when={isBotDisplayed()}>
        <Bot {...botProps} />
      </Show>
    </EnvironmentProvider>
  )
}
