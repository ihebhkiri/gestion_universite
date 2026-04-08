alter table refresh_tokens
add column is_valid boolean  default true;
