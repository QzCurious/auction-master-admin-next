import * as t from 'drizzle-orm/mysql-core';
import { mysqlTable as table } from 'drizzle-orm/mysql-core';

export const carousel = table('carousel', {
  id: t.int().primaryKey().autoincrement(),
  groupId: t.int().notNull(),
  desktopImageUrl: t.varchar({ length: 255 }).notNull(),
  mobileImageUrl: t.varchar({ length: 255 }).notNull(),
  sorted: t.tinyint().notNull(),
  publishAt: t.datetime().notNull(),
  createdAt: t
    .datetime()
    .notNull()
    .$default(() => new Date()),
  updatedAt: t
    .datetime()
    .notNull()
    .$default(() => new Date())
    .$onUpdate(() => new Date()),
});

export const carouselGroup = table('carouselGroup', {
  id: t.int().primaryKey().autoincrement(),
  name: t.varchar({ length: 127 }).unique().notNull(),
  createdAt: t
    .datetime()
    .notNull()
    .$default(() => new Date()),
  updatedAt: t
    .datetime()
    .notNull()
    .$default(() => new Date())
    .$onUpdate(() => new Date()),
});
