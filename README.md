# Annotorious Algolia Semantic Tagging Plugin

A plugin to [Annotorious](http://annotorious.github.io) which adds __Semantic Tagging__
functionality: while typing the annotation, text is sent to an algoliaIndex to suggest possible tags, and the user can add them to the annotation by clicking on them (see screenshot). Tags are _Semantic Tags_ in the sense that they are not only strings, but (underneath the hood) include their corresponding algolia object.

[Based On](http://github.com/annotorious/annotorious-semantic-tagging-plugin)

Example Usage:

anno.addPlugin('SemanticTagging', { applicationId: '', apiKey: '', indexName: '' });