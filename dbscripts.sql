create schema stock_app;

CREATE TABLE stock_app.stock_names (
	company_symbol varchar(10) NOT NULL,
	company_name text NULL,
	CONSTRAINT stock_names_pkey PRIMARY KEY (company_symbol)
);

insert into stock_app.stock_names(company_symbol,company_name) 
values ('SCB','Standard Charted Bank'),
('NIB','Nepal Investment Bank'),
('PRB','Prabhu Bank'),
('YHL','Yak And Yeti Hotel Limited'),
('UNL','Unilever Nepal Limited'),
('NABIL','Nabil Bank Limited');

CREATE TABLE stock_app.stock_transaction (
	transaction_id serial NOT NULL,
	user_id varchar(20) NULL,
	company_symbol varchar(10) NULL,
	transaction_type varchar(4) NULL,
	quantity int4 NULL,
	amount int4 NULL,
	transaction_date date NULL,
	CONSTRAINT stock_transaction_pkey PRIMARY KEY (transaction_id)
);

ALTER TABLE stock_app.stock_transaction ADD CONSTRAINT stock_transaction_fk FOREIGN KEY (company_symbol) REFERENCES stock_app.stock_names(company_symbol);