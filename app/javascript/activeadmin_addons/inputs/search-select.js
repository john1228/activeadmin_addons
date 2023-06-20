var initializer = function() {
  setupSearchSelect(document);

  $(document).on('has_many_add:after', function(event, container) {
    setupSearchSelect(container);
  });

  function setupSearchSelect(container) {
    $('.search-select-input, .search-select-filter-input, ajax-filter-input', container).each(function(i, el) {
      var element = $(el);
      var model = element.data('model');
      var url = element.data('url');
      var depends = element.data('depends');
      var fields = element.data('fields');
      var predicate = element.data('predicate');
      var displayName = element.data('display-name');
      var width = element.data('width');
      var responseRoot = element.data('response-root');
      var minimumInputLength = element.data('minimum-input-length');
      var order = element.data('order');

      var selectOptions = {
        width: width,
        minimumInputLength: minimumInputLength,
        placeholder: '',
        allowClear: true,
        ajax: {
          url: url,
          dataType: 'json',
          delay: 250,
          cache: true,
          data: function(params) {
            var textQuery = { m: 'or' };
            fields.forEach(function(field) {
              if (field == 'id') {
                textQuery[field + '_eq'] = params.term;
              } else {
                textQuery[field + '_' + predicate] = params.term;
              }
            });

            var query = {
              order: order,
              q: {
                groupings: [textQuery],
                combinator: 'and',
              },
            };

            depends.forEach(depend => {
              var dField = depend.split("-")[0];
              var dPredicate = depend.split("-")[1];
              var dElement = $("#" + model + "_" + dField);
              console.log(dElement);

              if ("in" === dPredicate) {
                if (dElement.length === 0) {
                  var dValues = [];
                  $("input[name='" + model + "[" + dField + "][]']").each(function () {
                    dValues.push($(this).val());
                  });
                  query.q[depend] = dependValues;
                } else {
                  query.q[depend] = dElement.val();
                }
              } else {
                query.q[depend] = $("#" + model + "_" + dField).val()
              }
            });
            console.log(query);
            return query;
          },
          processResults: function(data) {
            if (data.constructor == Object) {
              data = data[responseRoot];
            }

            return {
              results: jQuery.map(data, function(resource) {
                if (!resource[displayName]) {
                  resource[displayName] = 'No display name for id #' + resource.id.toString();
                }
                return {
                  id: resource.id,
                  text: resource[displayName].toString(),
                };
              }),
            };
          },
        },
      };

      $(el).select2(selectOptions);
    });
  }
};

$(initializer);
$(document).on('turbolinks:load turbo:load', initializer);
