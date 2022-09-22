(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['mainMenu'] = template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<link rel=\"stylesheet\" href=\"partial-styles/main-menu.css\">\n\n<div id=\"main-menu\">\n    <button type=\"button\" id=\"create-room-button\">CREATE ROOM</button>\n    <div id=\"join-room-container\">\n        <input type=\"text\" placeholder=\"paste room id\" id=\"id-reciver\">\n        <button type=\"button\" id=\"join-room-button\">JOIN ROOM</button>\n    </div>\n</div>";
},"useData":true});
})();