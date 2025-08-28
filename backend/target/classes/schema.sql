create table if not exists birth_certificates (
  id integer primary key autoincrement,
  first_name text not null,
  middle_name text,
  last_name text not null,
  date_of_birth text not null,
  gender text not null,
  time_of_birth text,
  place_of_birth text not null,
  father_name text not null,
  father_aadhaar_number text not null,
  father_aadhaar_file_path text,
  mother_name text not null,
  mother_aadhaar_number text not null,
  mother_aadhaar_file_path text,
  issuing_authority text,
  registration_number text,
  aadhaar_consent_given integer not null,
  aadhaar_consent_timestamp text,
  status text not null,
  certificate_pdf_path text
);

