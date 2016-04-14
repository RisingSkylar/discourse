import { isValidSearchTerm } from 'discourse/lib/search';
import { createWidget } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';

createWidget('search-term', {
  tagName: 'input',
  buildId: () => 'search-term',
  buildKey: () => 'search-term',

  defaultState() {
    return { value: null };
  },

  buildAttributes() {
    return { type: 'text', autofocus: true };
  },

  keyUp() {
    const val = this.state.value;
    const newVal = $(`#${this.buildId()}`).val();

    if (newVal !== val) {
      this.state.value = newVal;
      this.sendWidgetAction('searchChanged', newVal);
    }
  }
});

createWidget('search-menu-results', {
  tagName: 'div.results',

  html(attrs) {
    if (attrs.noResults) {
      return h('div.no-results', I18n.t('search.no_results'));
    }
  }
});

export default createWidget('search-menu', {
  tagName: 'div.search-menu',
  buildKey: () => 'search-menu',

  defaultState() {
    return { loading: false, results: [], noResults: false };
  },

  panelContents() {
    const { state } = this;
    const results = [this.attach('search-term')];

    if (state.loading) {
      results.push(h('div.searching', h('div.spinner')));
    } else {
      results.push(this.attach('search-menu-results', { noResults: state.noResults, results: state.results }));
    }

    return results;
  },

  html() {
    return this.attach('menu-panel', { maxWidth: 500, contents: () => this.panelContents() });
  },

  clickOutside() {
    this.sendWidgetAction('toggleSearchMenu');
  },

  searchChanged(term) {
    const { state } = this;

    state.noResults = false;
    if (isValidSearchTerm(term)) {
      state.loading = true;
    } else {
      state.results = [];
    }
  }
});
