import {
  createTable,
  SchemaMigrationsSpec,
} from "@nozbe/watermelondb/Schema/migrations";

const migration: SchemaMigrationsSpec["migrations"][number] = {
	toVersion: 3,
	steps: [
		createTable({
			name: "settings",
			columns: [
				{ name: "key", type: "string", isIndexed: true },
				{ name: "value", type: "string" },
			],
		}),
	],
};

export default migration;