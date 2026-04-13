exports.up = function (knex) {
    return knex.schema.alterTable("status_page", function (table) {
        table.text("plana_showcase_config").nullable();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable("status_page", function (table) {
        table.dropColumn("plana_showcase_config");
    });
};
