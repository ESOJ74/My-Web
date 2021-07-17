'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

const Certificado = mongoose.model('Certificado');
const { buildAnuncioFilterFromReq } = require('../../lib/utils');

// Return the list of certificado
router.get('/', (req, res, next) => {

  const start = parseInt(req.query.start) || 0;
  const limit = parseInt(req.query.limit) || 1000; // nuestro api devuelve max 1000 registros
  const sort = req.query.sort || '_id';
  const includeTotal = req.query.includeTotal === 'true';

  const filters = buildAnuncioFilterFromReq(req);

  Certificado.list(filters, start, limit, sort, includeTotal, function (err, certificados) {
    if (err) return next(err);
    res.json({ result: certificados });
  });
});

// Return the list of available tags
router.get('/tags', asyncHandler(async function (req, res) {
  const distinctTags = await Certificado.distinct('tags');
  res.json({ result: distinctTags });
}));

// Create
router.post('/', [ // validaciones:
  body('tags').custom(tags => {
    const allowed = Certificado.allowedTags();
    return tags.every(tag => allowed.includes(tag)) 
  }).withMessage(`allowed tags ${Certificado.allowedTags()}`),
  body('venta').isBoolean().withMessage('must be boolean'),
  body('precio').isNumeric().withMessage('must be numeric'),
], asyncHandler(async (req, res) => {
  
  validationResult(req).throw();
  const certificadoData = req.body;

  const certificado = new Certificado(certificadoData);
  const anuncioGuardado = await certificado.save();

  res.json({ result: anuncioGuardado });

}));

module.exports = router;
