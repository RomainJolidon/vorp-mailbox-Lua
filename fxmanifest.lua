game 'rdr3'
fx_version 'adamant'
rdr3_warning 'I acknowledge that this is a prerelease build of RedM, and I am aware my resources *will* become incompatible once RedM ships.'

client_scripts {
    'client/services/*.lua',
    'client/controllers/*.lua'
  }
  
  server_scripts {
    'server/services/*.lua',
    'server/controllers/*.lua'
  }
  
  shared_scripts {
    'locale.lua',
    'config.lua',
    'locales/en.lua',
    'locales/fr.lua'
  }

ui_page "html/index.html"

files {
  "html/index.html",
  "html/assets/css/*.css",
  "html/assets/js/*.js"
}