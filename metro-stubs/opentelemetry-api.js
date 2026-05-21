/**
 * Stub for optional @opentelemetry/api used by @supabase/supabase-js.
 * Supabase tracing no-ops when this package is unavailable.
 */
module.exports = {
  propagation: {
    inject() {},
    extract() {
      return {};
    },
  },
  context: {
    active() {
      return {};
    },
    with(_context, fn) {
      return typeof fn === 'function' ? fn() : undefined;
    },
  },
  trace: {
    getTracer() {
      return {
        startSpan() {
          return { end() {}, setAttribute() {} };
        },
      };
    },
  },
};
