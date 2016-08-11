var register = function(Handlebars) {
  // define handlebar helper functions
  var helpers = {
    select: function(value, options) {
      return options.fn(this)
        .split('\n')
        .map(function(v) {
          var t = "value='" + value + "'";
          var t1 = 'value="' + value + '"';
          var out = ! (RegExp(t).test(v) || RegExp(t1).test(v)) ? v : v.replace(t, t + ' selected="selected"');
          return out;
        })
        .join('\n')
    }
  };

  if (Handlebars && typeof(Handlebars.registerHelper) === "function") {
    // register helpers
    for (var prop in helpers) {
      Handlebars.registerHelper(prop, helpers[prop]);
    }
  } else {
    // just return helpers object if we can't register helpers here
    return helpers;
  }
};

// client
if (typeof window !== "undefined") {
  register(Handlebars);
}
// server
else {
  module.exports.register = register;
  module.exports.helpers = register(null);
}
