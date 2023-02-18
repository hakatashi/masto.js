import type {
  Announcement,
  Conversation,
  Notification,
  Status,
} from './entities';

type BaseEvent<Type extends string, Payload> = {
  event: Type;
  stream: string[];
  payload: Payload;
};

export type UpdateEvent = BaseEvent<'update', Status>;
export type DeleteEvent = BaseEvent<'delete', string>;
export type NotificationEvent = BaseEvent<'notification', Notification>;
export type FiltersChangedEvent = BaseEvent<'filters_changed', undefined>;
export type ConversationEvent = BaseEvent<'conversation', Conversation>;
export type AnnouncementEvent = BaseEvent<'announcement', Announcement>;
export type AnnouncementReactionEvent = BaseEvent<
  'announcement.reaction',
  { name: string; count: number; announcementId: string }
>;
export type AnnouncementDeleteEvent = BaseEvent<'announcement.delete', string>;
export type StatusUpdateEvent = BaseEvent<'status.update', Status>;

/* https://docs.joinmastodon.org/methods/streaming/#events-11 */
export type Event =
  | UpdateEvent
  | DeleteEvent
  | NotificationEvent
  | FiltersChangedEvent
  | ConversationEvent
  | AnnouncementEvent
  | AnnouncementReactionEvent
  | AnnouncementDeleteEvent
  | StatusUpdateEvent;

export type RawEvent = Event & { payload: string };
