/**
 * Extends the Annotorious editor with the Semantic Tagging field.
 * @param {Object} annotator the annotator (provided by the Annotorious framework)
 */
annotorious.plugin.SemanticTagging.prototype._extendEditor = function(annotator) {
  var self = this,
      container = document.createElement('div'),
      idle_timeout,
      MIN_TEXT_LENGTH = 3,   // minimum length annotation must have before being allowed to the Algolia server
      TRIGGER_CHARS = ". ,", // characters that force an Algolia lookup
      IDLE_THRESHOLD = 500;  // Algolia is also done after IDLE_THRESHOLD milliseconds of key idleness

  container.className = 'semtagging-editor-container';

  // Adds a tag
  var addTag = function(annotation, hit, opt_css_class) {
    self._tags[hit.id] = hit.objectID;

    var link = document.createElement('a');
    link.style.cursor = 'pointer';
    link.className = 'semtagging-tag semtagging-editor-tag';
    link.innerHTML = hit.title;
    container.appendChild(link);

    var jqLink = jQuery(link);
    if (opt_css_class)
      jqLink.addClass(opt_css_class);

    jqLink.click(function() {
      if (!annotation.tags)
        annotation.tags = [];

      if (jqLink.hasClass('accepted')) {
        // Toggle to 'rejected'
        jqLink.toggleClass('accepted rejected');
        hit.status = 'rejected';
      } else if (jqLink.hasClass('rejected')) {
        // Toggle to 'don't care'
        jqLink.removeClass('rejected');
        delete hit.status;
        var idx = annotation.tags.indexOf(hit);
        if (idx > -1)
          annotation.tags.splice(idx, 1);
      } else {
        // Toggle to 'accepted'
        jqLink.addClass('accepted');
        delete hit.status;
        annotation.tags.push(hit);
      }
    });
  };

  // Does the Algolia lookup
  var doAlgolia = function(annotation, text) {
    var client = algoliasearch(self._APPLICATION_ID, self._API_KEY);
    var index = client.initIndex(self._INDEX_NAME);
    index.search(text, function searchDone(err, content) {
      if (content.hits.length > 0) {
        self._tags = [];
        container.innerHTML = '';
        jQuery.each(content.hits, function(idx, hit) {
          // Add to cached tag list and UI, if it is not already there
          // if (!self._tags[hit.id])
            addTag(annotation, hit);
        });
      }
    });
  };

  // Restarts the keyboard-idleness timeout
  var restartIdleTimeout = function(annotation, text) {
    if (idle_timeout)
      window.clearTimeout(idle_timeout);
    
    idle_timeout = window.setTimeout(function() { doAlgolia(annotation, text); }, IDLE_THRESHOLD);
  };

  // Add a key listener to Annotorious editor (and binds stuff to it)
  annotator.editor.element.addEventListener('keyup', function(event) {
    var annotation = annotator.editor.getAnnotation(),
        text = annotation.text;

    if (text.length > MIN_TEXT_LENGTH) {
      restartIdleTimeout(annotation, text);

      if (TRIGGER_CHARS.indexOf(text[text.length - 1]) > -1)
        doAlgolia(annotation, text);
    }
  });

  // Final step: adds the field to the editor
  annotator.editor.addField(function(annotation) {
    self._tags = [];
    container.innerHTML = '';
    if (annotation && annotation.tags) { 
      jQuery.each(annotation.tags, function(idx, hit) {
        var css_class = (hit.status == 'rejected') ? 'rejected' : 'accepted';
        addTag(annotation, hit, css_class);
      });
    }
    return container;
  });
}
