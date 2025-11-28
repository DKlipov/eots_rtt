set foldmethod=expr
set foldexpr=getline(v:lnum)=~'^/\\*\ [A-Z][A-Z].*\\*\\/$'?'>1':'='
