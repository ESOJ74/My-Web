'use strict';

const mongoose = require('mongoose');
const fsPromises = require('fs').promises;
const configCertificados = require('../local_config').certificados;
const path = require('path');

const certificadoSchema = mongoose.Schema({
  curso: { type: String, index: true },
  foto: String,
  tags: { type: [String], index: true }
});

/**
 * lista de tags permitidos
 */
certificadoSchema.statics.allowedTags = function () {
  return ['KeepCoding', 'DataCamp', 'FreeCodeCamp', 'LinkedIn', 'Google', 'Coursera', 'Udemy'];
};

/**
 * carga un json de certificados
 */
certificadoSchema.statics.cargaJson = async function (fichero) {
  
  const data = await fsPromises.readFile(fichero, { encoding: 'utf8' });

  if (!data) {
    throw new Error(fichero + ' está vacio!');
  }

  const certificados = JSON.parse(data).certificados;
  const numCertificados = certificados.length;

  for (var i = 0; i < certificados.length; i++) {
    await (new Certificado(certificados[i])).save();
  }

  return numCertificados;

};

certificadoSchema.statics.list = async function(filters, startRow, numRows, sortField, includeTotal, cb) {

  const query = Certificado.find(filters);
  query.sort(sortField);
  query.skip(startRow);
  query.limit(numRows);
  //query.select('nombre venta');

  const result = {};

  if (includeTotal) {
    result.total = await Certificado.countDocuments();
  }
  result.rows = await query.exec();

  // poner ruta base a imagenes
  const ruta = configCertificados.imagesURLBasePath;
  result.rows.forEach(r => r.foto = r.foto ? path.join(ruta, r.foto) : null );

  if (cb) return cb(null, result); // si me dan callback devuelvo los resultados por ahí
  return result; // si no, los devuelvo por la promesa del async (async está en la primera linea de esta función)
};

var Certificado = mongoose.model('Certificado', certificadoSchema);

module.exports = Certificado;
