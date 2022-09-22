(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['callingCard'] = template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<link rel=\"stylesheet\" href=\"partial-styles/calling-card.css\">\n\n<div class=\"calling-card\">\n    <div class=\"title\">\n        <div class=\"name\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"name") || (depth0 != null ? lookupProperty(depth0,"name") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data,"loc":{"start":{"line":5,"column":26},"end":{"line":5,"column":34}}}) : helper)))
    + "</div>\n        <div class=\"badge\">\n            <img src=\"assets/gold-elo.svg\">\n        </div>\n    </div>\n    <div class=\"stats\">\n        <div class=\"wlr\">wlr "
    + alias4(((helper = (helper = lookupProperty(helpers,"wlr") || (depth0 != null ? lookupProperty(depth0,"wlr") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"wlr","hash":{},"data":data,"loc":{"start":{"line":11,"column":29},"end":{"line":11,"column":36}}}) : helper)))
    + "</div>\n        <div class=\"elo\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"elo") || (depth0 != null ? lookupProperty(depth0,"elo") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"elo","hash":{},"data":data,"loc":{"start":{"line":12,"column":25},"end":{"line":12,"column":32}}}) : helper)))
    + "</div>\n    </div>\n</div>";
},"useData":true});
})();