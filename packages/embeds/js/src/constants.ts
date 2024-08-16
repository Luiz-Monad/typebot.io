import type { BubbleProps } from './features/bubble'
import type { PopupProps } from './features/popup'
import type { StandardProps } from './features/standard'
import type { BotProps } from './components/Bot'

const defaultBotProps: BotProps = {
  typebot: undefined,
  onNewInputBlock: undefined,
  onAnswer: undefined,
  onEnd: undefined,
  onInit: undefined,
  onNewLogs: undefined,
  isPreview: undefined,
  startFrom: undefined,
  prefilledVariables: undefined,
  apiHost: undefined,
  resultId: undefined,
  sessionId: undefined,
  font: undefined,
}

export const defaultStandardProps: StandardProps = {
  ...defaultBotProps,
  styles: undefined,
}

export const defaultPopupProps: PopupProps = {
  ...defaultBotProps,
  onClose: undefined,
  onOpen: undefined,
  theme: undefined,
  autoShowDelay: undefined,
  isOpen: undefined,
  defaultOpen: undefined,
  styles: undefined,
}

export const defaultBubbleProps: BubbleProps = {
  ...defaultBotProps,
  onClose: undefined,
  onOpen: undefined,
  theme: undefined,
  previewMessage: undefined,
  onPreviewMessageClick: undefined,
  autoShowDelay: undefined,
  styles: undefined,
}
