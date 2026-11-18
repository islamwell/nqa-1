import Dexie from "dexie";

const db = new Dexie("offilenData");
// v1 kept so existing installs have a valid upgrade path.
db.version(1).stores({
    audioList: `
    id,
    name,
    name_telugu,
    lyrics,
    lyrics_telugu,
    link,singerName,
    listen,
    download,
    album_id,
    author_id,
    category_id,
    link_app,
    order_number,
    image,
    description`,
});
// v2: only index fields actually queried (id, category_id; name for lookups).
// Dropping unused indexes (lyrics, description, ...) makes writes much faster and the DB smaller.
db.version(2).stores({
    audioList: "id, name, category_id",
});

export default db;
