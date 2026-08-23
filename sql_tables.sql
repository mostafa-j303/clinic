--
-- PostgreSQL database dump
--


-- Dumped from database version 18.4 (Debian 18.4-1.pgdg12+1)
-- Dumped by pg_dump version 18.1 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: get_all_category_names(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_all_category_names() RETURNS TABLE(id integer, name text)
    LANGUAGE sql
    AS $$
    SELECT id, name FROM categories ORDER BY name ASC;
$$;


--
-- Name: get_appointments(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_appointments() RETURNS TABLE(id integer, price text, offerprice text, name text, duration text, details json, featured_tier text, visit_count integer, validity_days integer)
    LANGUAGE sql
    AS $$
          SELECT 
              a.id,
              a.price,
              a.offer_price AS "offerPrice",
              a.name,
              a.duration,
              COALESCE(
                  json_agg(ad.detail ORDER BY ad.id) FILTER (WHERE ad.detail IS NOT NULL),
                  '[]'
              ) AS details,
              a.featured_tier,
              a.visit_count,
              a.validity_days
          FROM appointments a
          LEFT JOIN appointment_details ad ON a.id = ad.appointment_id
          GROUP BY a.id, a.price, a.offer_price, a.name, a.duration, a.featured_tier, a.visit_count, a.validity_days
          ORDER BY CASE a.featured_tier WHEN 'gold' THEN 0 WHEN 'silver' THEN 1 WHEN 'bronze' THEN 2 ELSE 3 END, a.id ASC;
      $$;


--
-- Name: get_image_data(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_image_data() RETURNS TABLE(id integer, filename text, mimetype text, image_url text, image_key text)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id,
    i.filename::TEXT,
    i.mimetype::TEXT,
    i.image_url::TEXT,
    i.image_key::TEXT
  FROM images i
  ORDER BY i.id ASC;
END;
$$;


--
-- Name: get_settings_data(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_settings_data() RETURNS TABLE(my_location text, web_title text, primary_color text, hover_primary text, secondary_color text, hover_secondary text, accent_color text, address text, building text, floor text, facebook text, tiktok text, instagram text, mail text, phone_number text, whatsapp_number text, discount text, min_order text, delivery text, reward_threshold integer, reward_bonus integer, site_url text)
    LANGUAGE sql
    AS $$
    SELECT
      s.my_location, s.web_title, s.primary_color, s.hover_primary,
      s.secondary_color, s.hover_secondary, s.accent_color,
      s.address, s.building, s.floor,
      s.facebook, s.tiktok, s.instagram, s.mail, s.phone_number, s.whatsapp_number,
      s.discount, s.min_order, s.delivery,
      s.reward_threshold, s.reward_bonus, s.site_url
    FROM settings s
    LIMIT 1;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin (
    id integer NOT NULL,
    passwordhash character varying(256) NOT NULL
);


--
-- Name: admin_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admin_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_id_seq OWNED BY public.admin.id;


--
-- Name: appointment_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointment_details (
    id integer NOT NULL,
    appointment_id integer,
    detail text NOT NULL
);


--
-- Name: appointment_details_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.appointment_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: appointment_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.appointment_details_id_seq OWNED BY public.appointment_details.id;


--
-- Name: appointment_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointment_requests (
    id integer NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone_number text NOT NULL,
    appointment_id integer NOT NULL,
    appointment_name text NOT NULL,
    selected_date timestamp without time zone NOT NULL,
    payment_method text NOT NULL,
    price_used text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status text DEFAULT 'Pending'::text NOT NULL,
    client_id integer,
    slot_start timestamp without time zone,
    slot_end timestamp without time zone,
    credit_id integer
);


--
-- Name: appointment_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.appointment_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: appointment_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.appointment_requests_id_seq OWNED BY public.appointment_requests.id;


--
-- Name: appointments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointments (
    id integer NOT NULL,
    name text NOT NULL,
    price text NOT NULL,
    offer_price text,
    duration text,
    visit_count integer,
    validity_days integer,
    featured_tier text,
    CONSTRAINT appointments_featured_tier_check CHECK ((featured_tier = ANY (ARRAY['gold'::text, 'silver'::text, 'bronze'::text])))
);


--
-- Name: appointments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.appointments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: appointments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.appointments_id_seq OWNED BY public.appointments.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(255) NOT NULL
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: client_intake_forms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_intake_forms (
    id integer NOT NULL,
    client_id integer,
    full_name text,
    age integer,
    phone_number text,
    gender text,
    occupation text,
    reason text,
    goals text[],
    specific_goal text,
    medical_conditions text[],
    past_surgeries text,
    food_allergies text,
    medications text,
    current_weight numeric,
    height_cm numeric,
    usual_weight numeric,
    typical_day_eating text,
    meals_per_day text,
    water_intake text,
    eat_out_frequency text,
    eating_behaviors text[],
    eating_challenges text,
    exercises boolean,
    exercise_details text,
    sleep_hours text,
    stress_level text,
    menstrual_regular text,
    women_conditions text[],
    has_lab_tests boolean,
    lab_results text,
    readiness_scale integer,
    expected_challenges text,
    expectations text,
    additional_info text,
    submitted_at timestamp without time zone DEFAULT now(),
    smokes boolean,
    drinks_alcohol boolean,
    pregnant_breastfeeding boolean,
    food_dislikes text,
    budget_constraints text
);


--
-- Name: client_intake_forms_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.client_intake_forms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: client_intake_forms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.client_intake_forms_id_seq OWNED BY public.client_intake_forms.id;


--
-- Name: client_package_credits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_package_credits (
    id integer NOT NULL,
    client_id integer NOT NULL,
    appointment_id integer NOT NULL,
    total_visits integer NOT NULL,
    remaining_visits integer NOT NULL,
    completed_visits integer DEFAULT 0 NOT NULL,
    purchased_at timestamp without time zone DEFAULT now(),
    expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: client_package_credits_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.client_package_credits_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: client_package_credits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.client_package_credits_id_seq OWNED BY public.client_package_credits.id;


--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients (
    id integer NOT NULL,
    google_id text,
    email text NOT NULL,
    full_name text,
    password_hash text,
    profile_completed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    phone_number text,
    gender text,
    is_suspended boolean DEFAULT false
);


--
-- Name: clients_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.clients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.clients_id_seq OWNED BY public.clients.id;


--
-- Name: clinic_closures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clinic_closures (
    id integer NOT NULL,
    closure_date date NOT NULL,
    slot_time time without time zone,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: clinic_closures_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.clinic_closures_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: clinic_closures_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.clinic_closures_id_seq OWNED BY public.clinic_closures.id;


--
-- Name: clinic_hours; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clinic_hours (
    id integer NOT NULL,
    day_of_week smallint NOT NULL,
    is_closed boolean DEFAULT true NOT NULL,
    open_time time without time zone,
    close_time time without time zone,
    CONSTRAINT clinic_hours_day_of_week_check CHECK (((day_of_week >= 0) AND (day_of_week <= 6)))
);


--
-- Name: clinic_hours_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.clinic_hours_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: clinic_hours_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.clinic_hours_id_seq OWNED BY public.clinic_hours.id;


--
-- Name: images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.images (
    id integer NOT NULL,
    filename character varying(255),
    mimetype character varying(100),
    image_url text NOT NULL,
    image_key text NOT NULL
);


--
-- Name: images_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.images_id_seq OWNED BY public.images.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    CONSTRAINT order_items_quantity_check CHECK ((quantity > 0))
);


--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    address text NOT NULL,
    location_link text,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    name character varying(255),
    last_name character varying(255),
    phone character varying(50),
    payment_method character varying(50)
);


--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: product_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_images (
    id integer NOT NULL,
    product_id integer NOT NULL,
    filename character varying(255),
    mimetype character varying(100),
    image_url text NOT NULL
);


--
-- Name: product_images_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_images_id_seq OWNED BY public.product_images.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id integer NOT NULL,
    category_id integer,
    name character varying(255) NOT NULL,
    price text NOT NULL,
    details text
);


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    my_location text,
    web_title text,
    discount text,
    min_order text,
    delivery text,
    primary_color text,
    hover_primary text,
    secondary_color text,
    hover_secondary text,
    address text,
    building text,
    floor text,
    facebook text,
    tiktok text,
    instagram text,
    mail text,
    phone_number text,
    whatsapp_number text,
    accent_color text DEFAULT '#059669'::text,
    reward_threshold integer,
    reward_bonus integer,
    site_url text
);


--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- Name: view_products_with_image; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.view_products_with_image AS
 SELECT p.id,
    p.name,
    p.price,
    p.details,
    c.name AS category,
    pi.filename,
    pi.mimetype,
    pi.image_url
   FROM ((public.products p
     JOIN public.categories c ON ((p.category_id = c.id)))
     LEFT JOIN LATERAL ( SELECT product_images.id,
            product_images.product_id,
            product_images.filename,
            product_images.mimetype,
            product_images.image_url
           FROM public.product_images
          WHERE (product_images.product_id = p.id)
          ORDER BY product_images.id
         LIMIT 1) pi ON (true));


--
-- Name: admin id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin ALTER COLUMN id SET DEFAULT nextval('public.admin_id_seq'::regclass);


--
-- Name: appointment_details id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_details ALTER COLUMN id SET DEFAULT nextval('public.appointment_details_id_seq'::regclass);


--
-- Name: appointment_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_requests ALTER COLUMN id SET DEFAULT nextval('public.appointment_requests_id_seq'::regclass);


--
-- Name: appointments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments ALTER COLUMN id SET DEFAULT nextval('public.appointments_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: client_intake_forms id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_intake_forms ALTER COLUMN id SET DEFAULT nextval('public.client_intake_forms_id_seq'::regclass);


--
-- Name: client_package_credits id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_package_credits ALTER COLUMN id SET DEFAULT nextval('public.client_package_credits_id_seq'::regclass);


--
-- Name: clients id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients ALTER COLUMN id SET DEFAULT nextval('public.clients_id_seq'::regclass);


--
-- Name: clinic_closures id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinic_closures ALTER COLUMN id SET DEFAULT nextval('public.clinic_closures_id_seq'::regclass);


--
-- Name: clinic_hours id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinic_hours ALTER COLUMN id SET DEFAULT nextval('public.clinic_hours_id_seq'::regclass);


--
-- Name: images id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.images ALTER COLUMN id SET DEFAULT nextval('public.images_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: product_images id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images ALTER COLUMN id SET DEFAULT nextval('public.product_images_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- Name: admin admin_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_pkey PRIMARY KEY (id);


--
-- Name: appointment_details appointment_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_details
    ADD CONSTRAINT appointment_details_pkey PRIMARY KEY (id);


--
-- Name: appointment_requests appointment_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_requests
    ADD CONSTRAINT appointment_requests_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: client_intake_forms client_intake_forms_client_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_intake_forms
    ADD CONSTRAINT client_intake_forms_client_id_key UNIQUE (client_id);


--
-- Name: client_intake_forms client_intake_forms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_intake_forms
    ADD CONSTRAINT client_intake_forms_pkey PRIMARY KEY (id);


--
-- Name: client_package_credits client_package_credits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_package_credits
    ADD CONSTRAINT client_package_credits_pkey PRIMARY KEY (id);


--
-- Name: clients clients_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_email_key UNIQUE (email);


--
-- Name: clients clients_google_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_google_id_key UNIQUE (google_id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: clinic_closures clinic_closures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinic_closures
    ADD CONSTRAINT clinic_closures_pkey PRIMARY KEY (id);


--
-- Name: clinic_hours clinic_hours_day_of_week_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinic_hours
    ADD CONSTRAINT clinic_hours_day_of_week_key UNIQUE (day_of_week);


--
-- Name: clinic_hours clinic_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinic_hours
    ADD CONSTRAINT clinic_hours_pkey PRIMARY KEY (id);


--
-- Name: images images_image_key_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.images
    ADD CONSTRAINT images_image_key_unique UNIQUE (image_key);


--
-- Name: images images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.images
    ADD CONSTRAINT images_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_product_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_key UNIQUE (product_id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: idx_appointment_requests_slot; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointment_requests_slot ON public.appointment_requests USING btree (slot_start, slot_end);


--
-- Name: idx_client_package_credits_client; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_client_package_credits_client ON public.client_package_credits USING btree (client_id);


--
-- Name: idx_clinic_closures_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clinic_closures_date ON public.clinic_closures USING btree (closure_date);


--
-- Name: appointment_details appointment_details_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_details
    ADD CONSTRAINT appointment_details_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;


--
-- Name: appointment_requests appointment_requests_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_requests
    ADD CONSTRAINT appointment_requests_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: appointment_requests appointment_requests_credit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_requests
    ADD CONSTRAINT appointment_requests_credit_id_fkey FOREIGN KEY (credit_id) REFERENCES public.client_package_credits(id);


--
-- Name: client_intake_forms client_intake_forms_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_intake_forms
    ADD CONSTRAINT client_intake_forms_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: client_package_credits client_package_credits_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_package_credits
    ADD CONSTRAINT client_package_credits_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id);


--
-- Name: client_package_credits client_package_credits_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_package_credits
    ADD CONSTRAINT client_package_credits_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: appointment_requests fk_appointment; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_requests
    ADD CONSTRAINT fk_appointment FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE RESTRICT;


--
-- Name: order_items fk_order; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items fk_product; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- PostgreSQL database dump complete
--


