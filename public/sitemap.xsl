<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
  exclude-result-prefixes="s">

  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <title>SammyGuru Sitemap</title>
        <style type="text/css">
          body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 2rem; background: #f8fafc; color: #0f172a; }
          h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
          p.meta { color: #64748b; margin-top: 0; margin-bottom: 1.5rem; }
          table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
          th, td { text-align: left; padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0; font-size: 0.9rem; }
          th { background: #0f172a; color: #fff; font-weight: 600; }
          tr:hover td { background: #f1f5f9; }
          a { color: #2563eb; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .pri { font-variant-numeric: tabular-nums; }
        </style>
      </head>
      <body>
        <h1>SammyGuru XML Sitemap</h1>
        <p class="meta">
          <xsl:value-of select="count(//s:url)"/> URLs in this sitemap
          · For search engines; styled for easier reading
        </p>
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Last modified</th>
              <th>Change frequency</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="//s:url">
              <tr>
                <td>
                  <a href="{s:loc}">
                    <xsl:value-of select="s:loc"/>
                  </a>
                </td>
                <td><xsl:value-of select="s:lastmod"/></td>
                <td><xsl:value-of select="s:changefreq"/></td>
                <td class="pri"><xsl:value-of select="s:priority"/></td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
