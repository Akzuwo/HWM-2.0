// Apply the same hover capability rule to handwritten CSS and Tailwind utilities.
module.exports = () => ({
  postcssPlugin: 'hwm-hover-capabilities',
  OnceExit(root, { postcss }) {
    root.walkRules(rule => {
      if (!rule.selector?.includes(':hover')) return;
      for (let parent = rule.parent; parent; parent = parent.parent) {
        if (parent.type === 'atrule' && parent.name === 'media' && parent.params.includes('hover: hover')) return;
      }
      const hover = rule.selectors.filter(selector => selector.includes(':hover'));
      const other = rule.selectors.filter(selector => !selector.includes(':hover'));
      const media = postcss.atRule({ name: 'media', params: '(hover: hover)' });
      media.append(rule.clone({ selector: hover.join(',\n') }));
      rule.before(media);
      if (other.length) rule.selector = other.join(',\n');
      else rule.remove();
    });
  }
});
module.exports.postcss = true;
