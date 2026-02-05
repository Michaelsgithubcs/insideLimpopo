function fixFeaturedImageUrl(req, res, next) {
  if (req.body && req.body.image_url && !req.body.featured_img_url) {
    req.body.featured_img_url = req.body.image_url;
  }
  next();
}

module.exports = { fixFeaturedImageUrl }; 