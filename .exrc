set foldmethod=expr
set foldexpr=getline(v:lnum)=~'^/\\*\ [A-Z][A-Z].*\\*\\/$'?'>1':'='
set expandtab
set sw=4
set sts=4
