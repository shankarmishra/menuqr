import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isUsableImageUrl } from './imageUrl.ts';

describe('isUsableImageUrl', () => {
  it('rejects search-engine result pages', () => {
    assert.equal(isUsableImageUrl('https://www.google.com/search?tbm=isch&q=%22Matar+Mushroom%22'), false);
    assert.equal(isUsableImageUrl('https://www.bing.com/images/search?q=paneer'), false);
  });
  it('accepts real image links and local paths', () => {
    assert.equal(isUsableImageUrl('https://images.unsplash.com/photo-1.jpg'), true);
    assert.equal(isUsableImageUrl('https://lh3.googleusercontent.com/abc=w600'), true);
    assert.equal(isUsableImageUrl('/uploads/dishes/a.webp'), true);
    assert.equal(isUsableImageUrl('data:image/png;base64,AAAA'), true);
  });
  it('rejects empty and non-http values', () => {
    assert.equal(isUsableImageUrl(''), false);
    assert.equal(isUsableImageUrl(null), false);
    assert.equal(isUsableImageUrl('javascript:alert(1)'), false);
  });
});
