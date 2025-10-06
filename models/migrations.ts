import {
  schemaMigrations
} from "@nozbe/watermelondb/Schema/migrations";

import migration001 from "./migrations/20251005233000-createTable-settings";

export default schemaMigrations({
	migrations: [migration001],
});
