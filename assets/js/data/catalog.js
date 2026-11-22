/**
 * The loaded catalog and courses: the single source of data for every page.
 * Filled once by load.js at start-up; views only read from it.
 */

/** @typedef {{id:string,name:string,blurb?:string}} Topic */
/** @typedef {{id:string,name:string,title?:string,bio?:string,photo?:string,external?:boolean}} Person */

export const App = {
  /** data/catalog.json as loaded */
  cat: null,
  /** course id → course.json (or a placeholder for planned courses) */
  courses: {},
  /** course id → its catalog entry ({id, topic, status, data, partOf}) */
  entries: {},
  /** course ids in catalog order */
  order: [],
  /** person id → instructor */
  people: {},
  /** @type {Topic[]} */
  topics: [],
  /** catalog entries whose course.json could not be loaded: [{id, reason}] */
  failed: []
};

/** Site name from the catalog, used in titles. */
export const siteName = () => (App.cat && App.cat.platform && App.cat.platform.name) || 'Kalam Learning';

/** The course's topic id (catalog entry wins over the course's own "category"). */
export const topicId = c => App.entries[c.id]?.topic || c.category;
/** The course's topic object, if any. */
export const topicOf = c => App.topics.find(t => t.id === topicId(c));
/** The course's instructors as person objects (unknown ids are skipped). */
export const peopleOf = c => (c.instructors || []).map(i => App.people[i]).filter(Boolean);
/** Collections that belong to this course (Expert Picks = Excel's extra videos). */
export const extrasOf = c => App.order.map(id => App.courses[id]).filter(x => x.partOf === c.id);
/** Courses shown in lists: live and planned, but not collections that belong to another course. */
export const listed = () => App.order.map(id => App.courses[id]).filter(c => !c.partOf);
/** Live, normal courses (not planned, not collections). */
export const live = () => listed().filter(c => !c.soon && c.type !== 'collection');
/** Planned ("soon") courses. */
export const planned = () => listed().filter(c => c.soon);
