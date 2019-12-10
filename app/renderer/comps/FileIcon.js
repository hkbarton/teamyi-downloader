import React from "react"

import threeds from "icons/file_3ds.svg"
import aac from "icons/file_aac.svg"
import ai from "icons/file_ai.svg"
import avi from "icons/file_avi.svg"
import bmp from "icons/file_bmp.svg"
import cdr from "icons/file_cdr.svg"
import cgm from "icons/file_cgm.svg"
import css from "icons/file_css.svg"
import csv from "icons/file_csv.svg"
import dbf from "icons/file_dbf.svg"
import doc from "icons/file_doc.svg"
import docx from "icons/file_docx.svg"
import dwf from "icons/file_dwf.svg"
import dwg from "icons/file_dwg.svg"
import eps from "icons/file_eps.svg"
import exe from "icons/file_exe.svg"
import fla from "icons/file_fla.svg"
import gif from "icons/file_gif.svg"
import hpgl from "icons/file_hpgl.svg"
import html from "icons/file_html.svg"
import ico from "icons/file_ico.svg"
import iso from "icons/file_iso.svg"
import jpg from "icons/file_jpg.svg"
import jpeg from "icons/file_jpeg.svg"
import js from "icons/file_js.svg"
import json from "icons/file_json.svg"
import key from "icons/file_keynote.svg"
import m4a from "icons/file_m4a.svg"
import mov from "icons/file_mov.svg"
import mp3 from "icons/file_mp3.svg"
import mp4 from "icons/file_mp4.svg"
import nds from "icons/file_nds.svg"
import note from "icons/file_note.svg"
import numbers from "icons/file_numbers.svg"
import pages from "icons/file_pages.svg"
import pdf from "icons/file_pdf.svg"
import plt from "icons/file_plt.svg"
import png from "icons/file_png.svg"
import heic from "icons/file_heic.svg"
import ppt from "icons/file_ppt.svg"
import pptx from "icons/file_pptx.svg"
import psd from "icons/file_psd.svg"
import rp from "icons/file_axure.svg"
import rtf from "icons/file_rtf.svg"
import sketch from "icons/file_sketch.svg"
import step from "icons/file_step.svg"
import svg from "icons/file_svg.svg"
import paper from "icons/file_paper.svg"
import txt from "icons/file_txt.svg"
import webm from "icons/file_webm.svg"
import webp from "icons/file_webp.svg"
import xls from "icons/file_xls.svg"
import xlsx from "icons/file_xlsx.svg"
import xml from "icons/file_xml.svg"
import zip from "icons/file_zip.svg"
import gz from "icons/file_gz.svg"
import wps from "icons/file_wps.svg"
import et from "icons/file_et.svg"
import dps from "icons/file_dps.svg"
import unknown from "icons/file_unknown.svg"
import unknownExt from "icons/file_unknown_format.svg"

const iconByTypes = {
  "3ds": threeds,
  aac,
  ai,
  avi,
  bmp,
  cdr,
  cgm,
  css,
  csv,
  dbf,
  doc,
  docx,
  dwf,
  dwg,
  eps,
  exe,
  fla,
  gif,
  hpgl,
  html,
  ico,
  iso,
  jpg,
  jpeg,
  js,
  json,
  key,
  m4a,
  mov,
  mp3,
  mp4,
  nds,
  note,
  numbers,
  pages,
  pdf,
  plt,
  png,
  heic,
  ppt,
  pptx,
  psd,
  rp,
  rtf,
  sketch,
  step,
  svg,
  paper,
  txt,
  webm,
  webp,
  xls,
  xlsx,
  xml,
  zip,
  gz,
  wps,
  et,
  dps,
}

export default function(props) {
  const { name } = props
  const nameParts = name.split(".")
  const ext = nameParts.pop()
  let Icon = iconByTypes[ext]
  let showLabel = false
  if (!Icon) {
    Icon = nameParts.length > 0 ? unknownExt : unknown
    showLabel = nameParts.length > 0
  }

  return (
    <div className="file-icon">
      <Icon />
      {showLabel ? <span className="file-ext">{ext.toUpperCase()}</span> : null}
    </div>
  )
}
