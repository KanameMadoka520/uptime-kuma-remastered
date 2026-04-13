exports.up = function (knex) {
    return knex.schema.alterTable("status_page", function (table) {
        table.boolean("default_status_sort_enabled").notNullable().defaultTo(true);
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable("status_page", function (table) {
        table.dropColumn("default_status_sort_enabled");
    });
};
