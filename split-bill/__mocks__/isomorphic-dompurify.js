// Manual mock for isomorphic-dompurify
// Avoids pulling in the full jsdom chain (undici/cssstyle/css-color ESM deps)
const dompurify = {
  sanitize: function (dirty) {
    if (!dirty || typeof dirty !== 'string') return '';
    // Strip actual HTML tags only (tags start with a letter, /, or !)
    return dirty.replace(/<[a-zA-Z/!][^>]*>/g, '');
  },
};

module.exports = dompurify;
