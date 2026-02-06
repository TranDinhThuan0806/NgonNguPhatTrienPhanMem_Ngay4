var express = require('express');
var router = express.Router();
let { RandomToken } = require('../utils/GenToken')
let { data } = require('../utils/data')
let slugify = require('slugify')
let { IncrementalId } = require('../utils/IncrementalIdHandler')

/* GET users listing. */
///api/v1/products
router.get('/', function (req, res, next) {
  const titleQ = req.query.title ? req.query.title : '';
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : 1E4;
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : 0;
  const categoryName = req.query.category ? req.query.category : '';
  const result = data.filter(function (e) {
    if (e.isDeleted) return false;
    const titleMatch = e.title.toLowerCase().includes(titleQ.toLowerCase());
    const priceMatch = (typeof e.price === 'number') && e.price >= minPrice && e.price <= maxPrice;
    const catName = e.category && e.category.name ? e.category.name : '';
    const categoryMatch = catName.toLowerCase().includes(categoryName.toLowerCase());
    return titleMatch && priceMatch && categoryMatch;
  })
  res.send(result);
});
router.get('/slug/:slug', function (req, res, next) {
  let slug = req.params.slug;
  let result = data.find(
    function (e) {
      return (!e.isDeleted) && e.slug == slug;
    }
  )
  if (result) {
    res.status(200).send(result)
  } else {
    res.status(404).send({
      message: "SLUG NOT FOUND"
    })
  }
});
///api/v1/products/1
router.get('/:id', function (req, res, next) {
  const id = Number(req.params.id);
  let result = data.find(function (e) {
    return (!e.isDeleted) && e.id === id
  });
  if (result) {
    res.status(200).send(result)
  } else {
    res.status(404).send({
      message: "ID NOT FOUND"
    })
  }
});
router.post('/', function (req, res, next) {
  const body = req.body || {};
  if (!body.title || body.price == null) {
    return res.status(400).send({ message: 'title and price are required' })
  }
  let slugBase = slugify(body.title, { replacement: '-', lower: true, locale: 'vi' });
  const ensureUniqueSlug = (s) => {
    let out = s;
    while (data.find(d => d.slug === out)) {
      out = s + '-' + RandomToken(4).toLowerCase();
    }
    return out;
  }
  const slug = ensureUniqueSlug(slugBase);
  // Build category object: accept full object or categoryId + optional name
  let category = null;
  if (body.category && typeof body.category === 'object') {
    category = body.category;
  } else if (body.categoryId) {
    category = {
      id: Number(body.categoryId),
      name: body.categoryName || ''
    }
  }
  let newObj = {
    id: IncrementalId(data),
    title: body.title,
    slug: slug,
    price: Number(body.price),
    description: body.description || '',
    category: category,
    images: Array.isArray(body.images) ? body.images : (body.images ? [body.images] : []),
    creationAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  data.push(newObj);
  res.status(201).send(newObj);
})
router.put('/:id', function (req, res, next) {
  const id = Number(req.params.id);
  let result = data.find(function (e) { return e.id === id });
  if (!result) {
    return res.status(404).send({ message: 'ID NOT FOUND' })
  }
  const body = req.body || {};
  const protectedFields = ['id', 'creationAt'];
  Object.keys(body).forEach(key => {
    if (protectedFields.includes(key)) return;
    if (key === 'categoryId') {
      result.category = Object.assign({}, result.category || {}, { id: Number(body.categoryId), name: body.categoryName || result.category?.name || '' })
      return;
    }
    if (key === 'title') {
      result.title = body.title;
      // regenerate slug and ensure unique
      let base = slugify(body.title, { replacement: '-', lower: true, locale: 'vi' });
      let newSlug = base;
      while (data.find(d => d.id !== result.id && d.slug === newSlug)) {
        newSlug = base + '-' + RandomToken(4).toLowerCase();
      }
      result.slug = newSlug;
      return;
    }
    result[key] = body[key];
  })
  result.updatedAt = new Date().toISOString();
  res.send(result)
})
router.delete('/:id', function (req, res, next) {
  const id = Number(req.params.id);
  let result = data.find(function (e) { return e.id === id });
  if (!result) {
    return res.status(404).send({ message: 'ID NOT FOUND' })
  }
  result.isDeleted = true;
  result.updatedAt = new Date().toISOString();
  res.send(result)
})

module.exports = router;
