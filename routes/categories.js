var express = require('express');
var router = express.Router();
var slugify = require('slugify');

// 1. Import dữ liệu products chung của hệ thống để xử lý query lấy sản phẩm
// Lưu ý: Đảm bảo đường dẫn tới utils/data là chính xác
var { data: products } = require('../utils/data'); 

// 2. Khởi tạo dữ liệu Categories (như bạn cung cấp)
let categories = [
    {
        "id": 7,
        "name": "Clothes",
        "slug": "clothes",
        "image": "https://i.imgur.com/QkIa5tT.jpeg",
        "creationAt": "2026-02-05T16:51:34.000Z",
        "updatedAt": "2026-02-05T16:51:34.000Z"
    },
    {
        "id": 8,
        "name": "Electronics",
        "slug": "electronics",
        "image": "https://i.imgur.com/ZANVnHE.jpeg",
        "creationAt": "2026-02-05T16:51:35.000Z",
        "updatedAt": "2026-02-05T16:51:35.000Z"
    },
    {
        "id": 9,
        "name": "Furniture",
        "slug": "furniture",
        "image": "https://i.imgur.com/Qphac99.jpeg",
        "creationAt": "2026-02-05T16:51:36.000Z",
        "updatedAt": "2026-02-05T16:51:36.000Z"
    },
    {
        "id": 10,
        "name": "Shoes",
        "slug": "shoes",
        "image": "https://i.imgur.com/qNOjJje.jpeg",
        "creationAt": "2026-02-05T16:51:36.000Z",
        "updatedAt": "2026-02-05T16:51:36.000Z"
    },
    {
        "id": 11,
        "name": "Miscellaneous",
        "slug": "miscellaneous",
        "image": "https://i.imgur.com/BG8J0Fj.jpg",
        "creationAt": "2026-02-05T16:51:37.000Z",
        "updatedAt": "2026-02-05T16:51:37.000Z"
    },
    {
        "id": 13,
        "name": "gargantilla",
        "slug": "gargantilla",
        "image": "https://firebasestorage.googleapis.com/v0/b/pruebasalejandro-597ed.firebasestorage.app/o/gargantilla.jpg?alt=media&token=6bbf8234-5112-4ca8-b130-5e49ed1f3140",
        "creationAt": "2026-02-05T21:09:36.000Z",
        "updatedAt": "2026-02-05T21:09:36.000Z"
    },
    {
        "id": 15,
        "name": "category_B",
        "slug": "category-b",
        "image": "https://pravatar.cc/",
        "creationAt": "2026-02-05T22:04:27.000Z",
        "updatedAt": "2026-02-05T22:04:27.000Z"
    },
    {
        "id": 16,
        "name": "string",
        "slug": "string",
        "image": "https://pravatar.cc/",
        "creationAt": "2026-02-05T22:04:28.000Z",
        "updatedAt": "2026-02-05T22:04:28.000Z"
    },
    {
        "id": 17,
        "name": "Anillos",
        "slug": "anillos",
        "image": "https://firebasestorage.googleapis.com/v0/b/pruebasalejandro-597ed.firebasestorage.app/o/Anillos.jpg?alt=media&token=b7de8064-d4eb-4680-a4e2-ad917838c6c8",
        "creationAt": "2026-02-06T02:40:20.000Z",
        "updatedAt": "2026-02-06T02:40:20.000Z"
    },
    {
        "id": 18,
        "name": "Testing Category",
        "slug": "testing-category",
        "image": "https://placeimg.com/640/480/any",
        "creationAt": "2026-02-06T06:04:54.000Z",
        "updatedAt": "2026-02-06T06:04:54.000Z"
    }
];

// --- CÁC ROUTE ---

// 1. Get All (Có lọc theo query 'name')
router.get('/', function(req, res, next) {
  const nameQuery = req.query.name;
  
  if (nameQuery) {
    const result = categories.filter(c => 
      c.name.toLowerCase().includes(nameQuery.toLowerCase())
    );
    return res.json(result);
  }
  
  res.json(categories);
});

// 2. Get By ID
router.get('/:id', function(req, res, next) {
  // Nếu request gọi endpoint products bên dưới, nó sẽ lọt vào route này nếu không parse kỹ
  // Tuy nhiên Express xử lý route tĩnh trước nếu define đúng thứ tự hoặc check params
  // Ở đây :id là dynamic
  const id = Number(req.params.id);
  const category = categories.find(c => c.id === id);
  
  if (category) {
    res.json(category);
  } else {
    res.status(404).json({ message: "CATEGORY NOT FOUND" });
  }
});

// 3. Get By Slug (Lưu ý: đặt route này TRƯỚC route /:id nếu slug có thể là số, 
// nhưng thường ta nên đặt tên path rõ ràng như /slug/:slug để tránh conflict)
router.get('/slug/:slug', function(req, res, next) {
  const slug = req.params.slug;
  const category = categories.find(c => c.slug === slug);
  
  if (category) {
    res.json(category);
  } else {
    res.status(404).json({ message: "SLUG NOT FOUND" });
  }
});

// 4. Create Category
router.post('/', function(req, res, next) {
  const body = req.body || {};
  if (!body.name) {
    return res.status(400).json({ message: "Name is required" });
  }

  // Tạo ID mới (Max ID + 1)
  const maxId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) : 0;
  
  // Tạo slug
  const slug = slugify(body.name, { replacement: '-', lower: true, locale: 'vi' });

  const newCategory = {
    id: maxId + 1,
    name: body.name,
    slug: slug,
    image: body.image || "https://placeimg.com/640/480/any",
    creationAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  categories.push(newCategory);
  res.status(201).json(newCategory);
});

// 5. Edit Category
router.put('/:id', function(req, res, next) {
  const id = Number(req.params.id);
  const category = categories.find(c => c.id === id);

  if (!category) {
    return res.status(404).json({ message: "CATEGORY NOT FOUND" });
  }

  const body = req.body;
  
  if (body.name) {
    category.name = body.name;
    // Cập nhật lại slug nếu đổi tên
    category.slug = slugify(body.name, { replacement: '-', lower: true, locale: 'vi' });
  }
  
  if (body.image) category.image = body.image;
  
  category.updatedAt = new Date().toISOString();
  
  res.json(category);
});

// 6. Delete Category
router.delete('/:id', function(req, res, next) {
  const id = Number(req.params.id);
  const index = categories.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "CATEGORY NOT FOUND" });
  }

  const deletedCategory = categories.splice(index, 1);
  res.json(deletedCategory[0]);
});

// 7. Get Products by Category ID
// Yêu cầu: /api/v1/categories/{id}/products
// Lưu ý: Route này cần đặt TRƯỚC route /:id nếu không dùng Regex, 
// nhưng do cấu trúc Express, ta nên define nó cụ thể. 
// Do router.get('/:id') đã bắt hết các pattern dạng số, nên ta phải xử lý khéo léo.
// Cách tốt nhất trong file riêng biệt:
// Express match từ trên xuống dưới.
// Vì URL là /:id/products, nó khác /:id. Express phân biệt được.

router.get('/:id/products', function(req, res, next) {
  const categoryId = Number(req.params.id);
  
  // Kiểm tra category có tồn tại không
  const categoryExists = categories.some(c => c.id === categoryId);
  if (!categoryExists) {
      return res.status(404).json({ message: "CATEGORY NOT FOUND" });
  }

  // Lọc từ file data (products) import ở đầu file
  // Logic check dựa trên cấu trúc product: e.category.id
  const result = products.filter(p => {
    // Kiểm tra đã xóa chưa
    if (p.isDeleted) return false;
    
    // Kiểm tra product có thuộc category này không
    // Cấu trúc trong file products.js: product.category = { id, name }
    return p.category && p.category.id === categoryId;
  });

  res.json(result);
});

module.exports = router;