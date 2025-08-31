--
-- PostgreSQL database dump
--

-- Dumped from database version 16.0
-- Dumped by pg_dump version 16.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: access; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.access (
    access_id integer NOT NULL,
    access_name character varying(100) NOT NULL,
    duration_in_days integer DEFAULT 1 NOT NULL,
    is_application boolean DEFAULT false,
    application_id integer
);


ALTER TABLE public.access OWNER TO postgres;

--
-- Name: access_access_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.access_access_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.access_access_id_seq OWNER TO postgres;

--
-- Name: access_access_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.access_access_id_seq OWNED BY public.access.access_id;


--
-- Name: access_alarm; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.access_alarm (
    gid_no character varying NOT NULL,
    access_id integer NOT NULL,
    deadline_date date NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.access_alarm OWNER TO postgres;

--
-- Name: application; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.application (
    application_id integer NOT NULL,
    application_name character varying(255) NOT NULL
);


ALTER TABLE public.application OWNER TO postgres;

--
-- Name: application_application_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.application_application_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.application_application_id_seq OWNER TO postgres;

--
-- Name: application_application_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.application_application_id_seq OWNED BY public.application.application_id;


--
-- Name: application_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.application_details (
    application_id integer NOT NULL,
    gid_no character varying(10) NOT NULL,
    head_application boolean DEFAULT false
);


ALTER TABLE public.application_details OWNER TO postgres;

--
-- Name: assigned_tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assigned_tasks (
    id integer NOT NULL,
    gid_no character varying(50) NOT NULL,
    task_id integer NOT NULL,
    deadline_days_left integer DEFAULT 7,
    assigned_at timestamp without time zone DEFAULT now(),
    completed_by_emp boolean DEFAULT false,
    completed_by_manager boolean DEFAULT false,
    completed_at timestamp without time zone,
    approved_at timestamp without time zone,
    manager_feedback text
);


ALTER TABLE public.assigned_tasks OWNER TO postgres;

--
-- Name: assigned_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.assigned_tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assigned_tasks_id_seq OWNER TO postgres;

--
-- Name: assigned_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assigned_tasks_id_seq OWNED BY public.assigned_tasks.id;


--
-- Name: employee_ui; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_ui (
    task_id integer NOT NULL,
    task_type character varying NOT NULL,
    task_name character varying NOT NULL,
    task_icon character varying NOT NULL,
    task_subtitle character varying,
    is_application boolean DEFAULT false,
    application_id integer
);


ALTER TABLE public.employee_ui OWNER TO postgres;

--
-- Name: employee_ui_steps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_ui_steps (
    task_id integer NOT NULL,
    step_number integer NOT NULL,
    description text NOT NULL
);


ALTER TABLE public.employee_ui_steps OWNER TO postgres;

--
-- Name: employee_ui_task_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employee_ui_task_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_ui_task_id_seq OWNER TO postgres;

--
-- Name: employee_ui_task_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employee_ui_task_id_seq OWNED BY public.employee_ui.task_id;


--
-- Name: offboard_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.offboard_requests (
    id integer NOT NULL,
    client_id integer,
    lan_id bigint NOT NULL,
    access_revoke text NOT NULL,
    acknowledged boolean NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    decided_by integer,
    decided_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    username text NOT NULL
);


ALTER TABLE public.offboard_requests OWNER TO postgres;

--
-- Name: offboard_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.offboard_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.offboard_requests_id_seq OWNER TO postgres;

--
-- Name: offboard_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.offboard_requests_id_seq OWNED BY public.offboard_requests.id;


--
-- Name: task_table; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.task_table (
    task_id integer NOT NULL,
    task_name character varying NOT NULL,
    task_description text,
    task_link character varying,
    task_duration integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    documents text[]
);


ALTER TABLE public.task_table OWNER TO postgres;

--
-- Name: task_table_task_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.task_table_task_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.task_table_task_id_seq OWNER TO postgres;

--
-- Name: task_table_task_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.task_table_task_id_seq OWNED BY public.task_table.task_id;


--
-- Name: user_access; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_access (
    gid_no character varying(50) NOT NULL,
    access_id integer NOT NULL,
    granted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_access OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    username character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    added_by_username character varying(255),
    gid_no character varying(50) NOT NULL,
    reporting_manager_gid character varying(7),
    phone character varying(20)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: access access_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.access ALTER COLUMN access_id SET DEFAULT nextval('public.access_access_id_seq'::regclass);


--
-- Name: application application_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application ALTER COLUMN application_id SET DEFAULT nextval('public.application_application_id_seq'::regclass);


--
-- Name: assigned_tasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assigned_tasks ALTER COLUMN id SET DEFAULT nextval('public.assigned_tasks_id_seq'::regclass);


--
-- Name: employee_ui task_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_ui ALTER COLUMN task_id SET DEFAULT nextval('public.employee_ui_task_id_seq'::regclass);


--
-- Name: offboard_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offboard_requests ALTER COLUMN id SET DEFAULT nextval('public.offboard_requests_id_seq'::regclass);


--
-- Name: task_table task_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_table ALTER COLUMN task_id SET DEFAULT nextval('public.task_table_task_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Data for Name: access; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.access (access_id, access_name, duration_in_days, is_application, application_id) FROM stdin;
1	Floor Access	10	f	\N
3	MOSS	2	f	\N
4	LAN ID	5	f	\N
5	Entuity Access	8	t	1
6	Magnet Access	3	t	2
7	Magnet ID	12	t	2
8	Entuity BMC	5	t	1
11	TechM sharepoint	2	f	\N
12	JIRA	2	f	\N
13	ServiceNow dev environment	3	t	8
14	ServiceNow Test Environment	3	t	8
15	ServiceNow Okta access_production	5	t	8
16	Citrix Access	5	f	\N
\.


--
-- Data for Name: access_alarm; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.access_alarm (gid_no, access_id, deadline_date, created_at) FROM stdin;
1118632	1	2025-07-20	2025-07-10 07:58:57.45643
1118632	3	2025-07-12	2025-07-10 07:58:57.458951
1118632	4	2025-07-15	2025-07-10 07:58:57.46038
1118632	11	2025-07-12	2025-07-10 07:58:57.461795
1118632	12	2025-07-12	2025-07-10 07:58:57.463626
1118630	1	2025-07-10	2025-06-30 01:16:57.556218
1118630	3	2025-07-02	2025-06-30 01:16:57.568078
1118633	1	2025-07-10	2025-06-30 01:24:59.492234
1118633	3	2025-07-02	2025-06-30 01:24:59.497142
1118632	16	2025-07-15	2025-07-10 07:58:57.469064
1118632	13	2025-07-13	2025-07-10 09:55:00.916924
1118632	14	2025-07-13	2025-07-10 09:55:00.916924
1118632	15	2025-07-15	2025-07-10 09:55:00.916924
1118633	5	2025-07-18	2025-07-10 10:00:49.284368
1118633	8	2025-07-15	2025-07-10 10:00:49.284368
1119373	6	2025-07-13	2025-07-10 10:01:01.939617
1119373	7	2025-07-22	2025-07-10 10:01:01.939617
1119373	11	2025-07-12	2025-07-10 10:01:01.939617
1119373	12	2025-07-12	2025-07-10 10:01:01.939617
1118634	1	2025-07-12	2025-07-02 13:23:02.029608
1119373	16	2025-07-15	2025-07-10 10:01:01.939617
1118634	3	2025-07-04	2025-07-02 13:23:02.038185
1118634	4	2025-07-07	2025-07-02 13:23:02.039882
0927889	1	2025-07-13	2025-07-03 06:05:36.517058
1118630	6	2025-07-13	2025-07-10 10:52:04.587468
0927889	3	2025-07-05	2025-07-03 06:05:36.543381
0927889	4	2025-07-08	2025-07-03 06:05:36.547298
1119373	1	2025-07-14	2025-07-04 00:46:30.526734
1118630	7	2025-07-22	2025-07-10 10:52:04.587468
1119373	3	2025-07-06	2025-07-04 00:46:30.533904
1119373	4	2025-07-09	2025-07-04 00:46:30.534758
1118636	1	2025-07-20	2025-07-10 23:04:09.126104
1118630	4	2025-07-12	2025-07-07 05:48:37.706483
1118636	3	2025-07-12	2025-07-10 23:04:09.130133
1118636	4	2025-07-15	2025-07-10 23:04:09.132173
1118636	6	2025-07-13	2025-07-10 23:04:09.134638
1118636	7	2025-07-22	2025-07-10 23:04:09.137485
1118636	11	2025-07-12	2025-07-10 23:04:09.140687
1118636	12	2025-07-12	2025-07-10 23:04:09.142864
1118636	16	2025-07-15	2025-07-10 23:04:09.144582
1118633	4	2025-07-15	2025-07-10 03:20:27.550561
1118633	11	2025-07-12	2025-07-10 03:20:27.550561
1118633	12	2025-07-12	2025-07-10 03:20:27.550561
1118633	16	2025-07-15	2025-07-10 03:20:27.550561
1118630	11	2025-07-12	2025-07-10 06:34:30.897915
1118630	12	2025-07-12	2025-07-10 06:34:30.897915
1118630	16	2025-07-15	2025-07-10 06:34:30.897915
\.


--
-- Data for Name: application; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.application (application_id, application_name) FROM stdin;
1	Entuity
2	Magnet
3	CMDB
8	ServiceNow
\.


--
-- Data for Name: application_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.application_details (application_id, gid_no, head_application) FROM stdin;
1	1118633	f
3	1000003	t
8	1118632	f
2	1119373	f
2	1118630	f
2	1118636	f
2	1118634	f
2	1000002	f
2	1000004	f
1	1000004	f
1	0927889	f
1	1000002	t
\.


--
-- Data for Name: assigned_tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assigned_tasks (id, gid_no, task_id, deadline_days_left, assigned_at, completed_by_emp, completed_by_manager, completed_at, approved_at, manager_feedback) FROM stdin;
5	1118632	13	4	2025-07-10 08:02:03.395595	f	f	\N	\N	\N
7	1119373	15	8	2025-07-10 09:46:45.793803	f	f	\N	\N	\N
9	0927889	15	8	2025-07-10 09:46:45.793803	f	f	\N	\N	\N
10	1118634	15	8	2025-07-10 09:46:45.793803	f	f	\N	\N	\N
11	1118630	15	8	2025-07-10 09:46:45.793803	f	f	\N	\N	\N
8	1118633	15	8	2025-07-10 09:46:45.793803	t	f	2025-07-10 09:59:10.974647	\N	\N
12	1118632	15	8	2025-07-10 09:46:45.793803	t	f	2025-07-10 10:08:24.701085	\N	\N
13	1118633	16	4	2025-07-10 10:31:47.009052	f	f	\N	\N	\N
14	0927889	16	4	2025-07-10 10:31:47.009052	f	f	\N	\N	\N
15	1118630	14	10	2025-07-11 01:02:05.568777	f	f	\N	\N	\N
\.


--
-- Data for Name: employee_ui; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_ui (task_id, task_type, task_name, task_icon, task_subtitle, is_application, application_id) FROM stdin;
5	access	Microsoft Teams	FaMicrosoft	Request Teams access	f	\N
3	access	Desktop/Laptop	FaLaptop	Request hardware allocation	f	\N
6	application	Citrix	FaDesktop	Request Citrix access	f	\N
18	application	ServiceNow User Access process	FaCogs	ServiceNow	t	8
7	application	Moss SharePoint	FaShareAlt	Request SharePoint access	f	\N
1	access	Floor Access	FaBuilding	Request physical floor access	f	\N
4	application	Entuity Access	FaProjectDiagram	Request application access	t	1
8	application	Magnet Access	FaCogs	Magnet Induction	t	2
12	application	CMDB	FaCogs	CMDB Induction	t	3
2	access	Client LAN ID	FaKey	Request network credentials	f	\N
\.


--
-- Data for Name: employee_ui_steps; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_ui_steps (task_id, step_number, description) FROM stdin;
18	1	<p>First process is that you have to go through to Okta <a href="https://techmahindra.sharepoint.com/sites/TUKOSS-ERP-MS/Application%20Management/Knowledge%20Management/SNOW%20KT/ServiceNow_%20Request%20Hanlding%20Via%20Okta%20V0.1%201.docx?d=w5de5d7ccb6334ad5badc3b76754271e9&amp;csf=1&amp;web=1&amp;e=aD1WSM" rel="noopener noreferrer" target="_blank" style="background-color: rgb(255, 255, 0);">User Guide</a>.</p>
18	2	<p><strong style="color: rgb(31, 56, 100);">User Request Submission:</strong></p><ol><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span>End user will raise request in ServiceNow platform through following: User need to send email to<span style="background-color: rgb(255, 255, 0);"> </span><a href="mailto:help@o2managedservices.com" rel="noopener noreferrer" target="_blank" style="background-color: rgb(255, 255, 0);">help@o2managedservices.com</a> or any of new user's colleague who has access to ServiceNow can raise request in ServiceNow platform on behalf of new user, alternatively user can contact SNOW admin directly for access.</li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span>User Account will be created in ServiceNow Application.</li></ol>
18	3	<p><br></p><ol><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span>Once the Request is processed with Okta.</li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span>User need to access this <a href="virginmediao2.okta.com " rel="noopener noreferrer" target="_blank" style="background-color: rgb(255, 255, 0);">link</a> for production environment</li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span>For development and test environments use this <a href="https://virginmediao2.oktapreview.com" rel="noopener noreferrer" target="_blank" style="background-color: rgb(255, 255, 0);">link</a></li></ol>
3	1	Ensure your request for a desktop or laptop has been approved by your manager or IT.
3	2	Visit the IT department or designated hardware distribution area to collect your device.
3	3	Sign the asset handover form provided by IT.
3	4	Verify that the device powers on and you can log in using your provided credentials.
3	5	Check that all required software and security tools are installed. If not, contact IT support.
3	6	Set up your email, VPN, and collaboration tools as instructed in your onboarding guide.
3	7	For remote desktop access, ensure Remote Desktop is enabled and you have the necessary permissions.
4	1	To get Access for Entuity application your line manager needs to raise a service request. New Entuity user accounts have to be requested from IT Access Control, to request an account a Remedy Request needs to be raised.
4	2	Accounts cannot be requested by the user, they must be requested on behalf of the user by their Line Manager.
4	3	Login to BMC Helix using your LAN ID and Password.
4	4	If you are not taken directly to the Service Management page, go to the above URL and search for “Eye of the Storm”.
4	5	Click on the “Eye Of The Storm” button and select “Request Now”.
4	6	Fill up the details and click on “Submit request”.
4	7	IT Access Control creates the account.
4	8	User receives credentials via email.
8	1	For getting the Magnet Application Access, you must be Beacon Compliance.
8	2	<p>Please drop email to Beacon Team <a href="mailto:beaconadmin@o2.com" rel="noopener noreferrer" target="_blank">beaconadmin@o2.com</a> to create your account. Once you got confirmation on account creation, login to Beacon portal and complete the Beacon Training.</p>
8	3	<p>Please drop an email to MAGNET Support team alogn with your Beacon certificate to egt access on Magnet Application.</p><p><a href="mailto:OSSSupportTeam@TechMahindra.com" rel="noopener noreferrer" target="_blank">OSSSupportTeam@TechMahindra.com</a></p>
12	1	<p>Hello fellas</p>
1	1	<p><strong>Offshore Floor Access</strong>: Fill the below form.</p>
1	2	<p>Send email to <strong>Kumar Gurav</strong> (<a href="mailto:KG00584135@TechMahindra.com" rel="noopener noreferrer" target="_blank">KG00584135@TechMahindra.com</a>) for approval with physical access form document.</p>
1	3	<p>Once you have the approval email, send email to <a href="mailto:Flashcard_Hinjewadi@techmahindra.com" rel="noopener noreferrer" target="_blank">Flashcard_Hinjewadi@techmahindra.com</a> team with attachment of approval email and Physical access form document. Once the security co-ordinator approves it, send the approval email, template, and Project allocation email to FlashCard Hinjewadi.</p>
1	4	<p><strong>Onshore Floor Access:</strong> For your UK based VMO2 Access card creation, please send email to Sonal Christian (<a href="mailto:Sonal.Christian@virginmediao2.co.uk" rel="noopener noreferrer" target="_blank">Sonal.Christian@virginmediao2.co.uk</a>) by attaching your passport size photograph.</p>
1	5	<p><a href="https://on-boarding-portal.s3.ap-south-1.amazonaws.com/PHYSICAL+ACCESS+RIGHTS.doc" rel="noopener noreferrer" target="_blank" style="background-color: rgb(255, 255, 0);">Download Physical Access Form.</a></p>
2	1	<p>Contact your IT administrator or onboarding coordinator to request a LAN ID (Local Area Network Identifier) for network access.</p>
2	2	Provide necessary details such as your full name, employee ID, and department.
2	3	<p>Once your <strong>LAN ID </strong>is created, you will receive credentials via email </p>
2	4	On Windows, you can find your LAN ID (MAC/IP): Go to Settings > Network & Internet > Ethernet/Wi-Fi > Properties.
7	1	<p>MOSS - TechM SharePoint: Please drop mail to Kumar Gurav (KG00584135@TechMahindra.com) with your TechM LAN ID and Email ID.</p>
2	5	Alternatively, open Command Prompt and run "ipconfig /all" to view your LAN ID (Physical/MAC Address).
2	6	If you face any issues, contact IT support for troubleshooting.
6	1	<p><strong style="color: black;">Installation of Citrix receiver </strong></p><ol><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><span style="color: black;">Login to </span><strong style="color: black;"><a href="https://helpnxt.techmahindra.com/sp?id=sc_category&amp;sys_id=bba172a84723f9902715e83a216d43a6&amp;catalog_id=e0d08b13c3330100c8b837659bba8fb4" rel="noopener noreferrer" target="_blank">TechM</a></strong><a href="https://helpnxt.techmahindra.com/sp?id=sc_category&amp;sys_id=bba172a84723f9902715e83a216d43a6&amp;catalog_id=e0d08b13c3330100c8b837659bba8fb4" rel="noopener noreferrer" target="_blank" style="color: black;"> </a><strong style="color: black;"><a href="https://helpnxt.techmahindra.com/sp?id=sc_category&amp;sys_id=bba172a84723f9902715e83a216d43a6&amp;catalog_id=e0d08b13c3330100c8b837659bba8fb4" rel="noopener noreferrer" target="_blank">HUB</a> </strong><a href="https://helpnxt.techmahindra.com/sp?id=sc_category&amp;sys_id=bba172a84723f9902715e83a216d43a6&amp;catalog_id=e0d08b13c3330100c8b837659bba8fb4 " rel="noopener noreferrer" target="_blank" style="color: red;"> </a></li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><strong><u>Raise Ticket to ISG, for Citrix Receiver software installation on your TechM </u></strong> <strong><u>laptop using below option:</u></strong></li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><strong><u>TechM HUB &gt;</u></strong><strong style="background-color: rgb(187, 187, 187);"><u> </u></strong><span style="background-color: rgb(187, 187, 187); color: rgb(36, 36, 36);">ISG &gt;Services &gt; SVC032 Software installation</span></li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span>Download the TIM HUB Service request Form from <span style="background-color: rgb(187, 187, 187);">User Guide&gt;Other Forms&gt;Approval Template&gt;TIM HUB Service request</span></li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span>Fill the form and mail to Kumar Gurav <span style="background-color: rgb(255, 255, 255); color: oklch(0.373 0.034 259.733);">(</span><u style="background-color: rgb(255, 255, 255); color: rgb(71, 85, 105);"><a href="mailto:KG00584135@TechMahindra.com" rel="noopener noreferrer" target="_blank">KG00584135@TechMahindra.com</a></u><span style="background-color: rgb(255, 255, 255); color: oklch(0.373 0.034 259.733);">)</span> for system approval.</li></ol>
6	2	<p>Download and install the Citrix Workspace app.</p>
6	3	<p><strong>RSA token Installation </strong></p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>You will receive an email in VMO2 account with instructions for RSA token (secondary password / passcode) installation and activation.</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>After following the instructions mentioned in above email, you will be able to set up Access for Remote desktop.</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Once Citrix receiver is installed and desktop access is received, click on the given <a href="https://gateway.o2.com/logon/LogonPoint/index.html" rel="noopener noreferrer" target="_blank">URL</a> to access your remote desktop and start your work.</li></ol>
6	4	<p>Enter your O2 LAN ID, Password received in email for your O2 LAN ID and 8 digit securID code which is generated <strong>without</strong> entering any 4 digit code.</p><p>Your O2 LAN password is expired which was sent by default in email which you entered in earlier step. So, you need to setup new O2 LAN password (keep it safe)</p>
6	5	<p>Confirm new O2 LAN password then you will be asked to set new 4 digit SecurID Passcode.Enter it and keep safe. close browser clean cache, also close SecurID App.</p>
6	6	<p>Open SecurID App again and open Citrix URL and enter O2 LAN ID, new O2 LAN password and go to SecurID app on mobile and enter 4 digit newly set PIN, it will show 8 digit code.Enter that 8 digit code as Password2 on Citrix login page.</p>
5	1	Login to the Office 365 portal using your organizational credentials.
5	2	Navigate to Microsoft Teams from the app launcher.
5	3	If you do not see Teams, contact your IT administrator to request access.
5	4	Download and install the Microsoft Teams desktop app for the best experience.
5	5	Sign in to the Teams app using your work email and password.
5	6	If you experience any issues, raise a support ticket with your IT helpdesk.
\.


--
-- Data for Name: offboard_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.offboard_requests (id, client_id, lan_id, access_revoke, acknowledged, status, decided_by, decided_at, created_at, username) FROM stdin;
51	73	1118632	Floor Access, JIRA, MOSS, hllo	t	rejected	1	2025-07-10 08:06:24.515208	2025-07-10 08:06:04.281406	Alish Sahdev
52	73	1118632	Floor Access, JIRA, MOSS, JIRA BMC	t	pending	\N	\N	2025-07-10 09:40:10.870672	Alish Sahdev
53	49	1118633	Floor Access, LAN ID, MOSS, BMC Helix ID	t	pending	\N	\N	2025-07-10 09:59:29.326607	Pradneya Prabhudesai
29	48	1118630	Floor Access, LAN ID, MOSS, REMOVE MY VMO2 LAN ID	t	rejected	47	2025-07-04 00:42:32.234599	2025-07-03 23:49:34.220146	Devidas Kaushik
28	48	1118630	, akajkja	t	rejected	47	2025-07-04 00:44:53.337538	2025-07-02 04:03:51.379732	Devidas Kaushik
\.


--
-- Data for Name: task_table; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.task_table (task_id, task_name, task_description, task_link, task_duration, created_at, documents) FROM stdin;
14	MAGNET Inducation KT Guide	<p>Following are the links of <strong>KT </strong>and <strong>Induction</strong> Process:</p><ol><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><a href="https://techmahindra.sharepoint.com/sites/TUKOSS-ERP-MS/Application%20Management/OSS/Magnet/KT%20Documents/Induction%20Training%20Tracker?csf=1&amp;web=1&amp;e=L5Kg5O" rel="noopener noreferrer" target="_blank">Induction Training tracker</a></li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><a href="https://techmahindra.sharepoint.com/sites/TUKOSS-ERP-MS/Application%20Management/OSS/Magnet/KT%20Documents/MagnetIPD_KT_Videos?csf=1&amp;web=1&amp;e=VEo10m" rel="noopener noreferrer" target="_blank">MagnetIPD KT </a></li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><a href="https://techmahindra.sharepoint.com/sites/TUKOSS-ERP-MS/Application%20Management/OSS/Magnet/KT%20Documents?csf=1&amp;web=1&amp;e=JZtfEa" rel="noopener noreferrer" target="_blank">Magnet Sharepoint</a></li></ol>	\N	10	2025-07-10 08:16:10.992424	{documents-1752160570757-569150736.docx}
15	VMO2 Common Documents	<p>This is a common induction guide for VMO2 new joined. Make proper use of it.</p><ol><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><a href="https://www.techmahindra.com/" rel="noopener noreferrer" target="_blank">Link to Mandatory Tasks</a></li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><a href="https://www.techmahindra.com/" rel="noopener noreferrer" target="_blank">Link to KT</a></li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><a href="https://www.techmahindra.com/" rel="noopener noreferrer" target="_blank">Link to Guides</a></li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><a href="https://www.techmahindra.com/" rel="noopener noreferrer" target="_blank">Link to Workflow</a></li></ol>	\N	8	2025-07-10 09:46:23.890457	{documents-1752165983408-270903897.pdf,documents-1752165983427-997058019.pdf,documents-1752165983470-511050131.docx}
13	ServiceNow Document	<ol><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span>This is a Induction Document click on this <a href="https://techmahindra.sharepoint.com/:x:/r/sites/TUKOSS-ERP-MS/_layouts/15/Doc.aspx?sourcedoc=%7B57954E43-0C07-4F41-A4BB-A38CDB71D310%7D&amp;file=Induction_KT_Tracking_Sheet_ServiceNow_Support.xlsx&amp;action=default&amp;mobileredirect=true" rel="noopener noreferrer" target="_blank">link</a></li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span>This is a KT Document <a href="https://techmahindra.sharepoint.com/sites/TUKOSS-ERP-MS/Application%20Management/Knowledge%20Management/SNOW%20KT/ServiceNow%20Induction_KT%20Document_%20v0.2.docx?d=w0a3f7bdcfb754d1db5ba25c87c19e62b&amp;csf=1&amp;web=1&amp;e=WkOsba" rel="noopener noreferrer" target="_blank">link</a></li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span>Link for ServiceNow <a href="https://techmahindra.sharepoint.com/:w:/r/sites/TUKOSS-ERP-MS/_layouts/15/Doc.aspx?sourcedoc=%7B34F03368-0285-491F-B745-D57692D242C8%7D&amp;file=Support%20Manual%20V%201.5.docx&amp;action=default&amp;mobileredirect=true" rel="noopener noreferrer" target="_blank">Support Manual</a></li></ol>	\N	4	2025-07-10 06:19:13.049988	{documents-1752153552632-773217954.xlsx}
16	Entuity KT Document	<ol><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><strong>Entuity Sharepoint</strong> <a href="http://collaboration.uk.pri.o2.com/sites/SSoT/OSS/default.aspx?RootFolder=%2Fsites%2FSSoT%2FOSS%2FDaily%20Ops%20Call%2FEOTS&amp;FolderCTID=0x012000F31F89118903CC41BF92C78B3759D66C&amp;View={25BB584F-603C-44DA-9106-529971D13DCC}" rel="noopener noreferrer" target="_blank">Link</a>.</li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span>Find Below the related Documents <strong>KT, database clean up Activity, Entuity RunBook and Entuity Induction Document</strong>.</li></ol>	\N	4	2025-07-10 10:30:50.564213	{documents-1752168650028-757158725.xlsx,documents-1752215966360-852547785.docx,documents-1752215966380-221137950.xlsx,documents-1752215966386-45081843.docx}
\.


--
-- Data for Name: user_access; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_access (gid_no, access_id, granted_at) FROM stdin;
1118632	1	2025-07-10 09:55:01.118103
1118632	12	2025-07-10 09:55:01.118103
1118632	3	2025-07-10 09:55:01.118103
1118633	1	2025-07-10 10:00:49.479798
1118633	4	2025-07-10 10:00:49.479798
1118633	3	2025-07-10 10:00:49.479798
1119373	1	2025-07-10 10:01:02.105224
1119373	4	2025-07-10 10:01:02.105224
1118630	1	2025-07-10 10:52:04.786061
1118630	4	2025-07-10 10:52:04.786061
1118630	3	2025-07-10 10:52:04.786061
1000002	1	2025-07-07 04:17:44.459079
1000002	4	2025-07-07 04:17:44.459079
1000002	3	2025-07-07 04:17:44.459079
1000004	1	2025-07-13 14:32:53.752033
1000004	6	2025-07-13 14:32:53.752033
1000004	3	2025-07-13 14:32:53.752033
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, username, password, email, role, active, created_at, added_by_username, gid_no, reporting_manager_gid, phone) FROM stdin;
73	Alish Sahdev	$2b$10$VSYICoHjwSrVybyhEi6lEehZNAvJ7pgk8bw0Fk1RYV8WDgd2.s3I6	AS001118632@techmahindra.com	client	t	2025-07-10 07:58:57.375325	\N	1118632	66792	8566941369
49	Pradneya Prabhudesai	$2b$10$rzmFJCZn1RBES8Lboia8juRYIx9.W3aSZelPlLXiOaXeDWFDbl2/C	PP001118633@techmahindra.com	client	t	2025-06-30 01:24:59.473193	\N	1118633	1000002	981238574
62	kundun	$2b$10$E.VYXKjoOxMj4Z3i9aGZBOoSmuYBMsrAoo4YCKwkrqHQZ5REKtd.W	KK001119373@techmahindra.com	client	t	2025-07-04 00:46:30.505132	\N	1119373	1000004	098765434532
48	Devidas Kaushik	$2b$10$QspLQupLya6kK/mq4GJTr.usSbjDgorwVDzg9DuNEo96hKVdMRtNG	DK001118630@techmahindra.com	client	t	2025-06-30 01:16:57.50799	\N	1118630	1000002	7507009026
1	Samant Sinha	$2b$10$BtqMshvIpFf7HLUnh4xH6.OLtPC9bAh2Jcui.2EF0pW3gQjAC3dY.	samant@gmail.com	admin	t	2025-05-28 00:42:21.566087	\N	1000000	\N	856699222
75	Rama Krishan	$2b$10$lspkYL6idilAIPwwXFp64uO.jdPJmk.a2XDWKnm5DoQmSnAtLi.TW	AS001118632@techmahindra.com	client	t	2025-07-10 23:04:08.94459	\N	1118636	1000004	98765456112
59	Anurag	$2b$10$QqRuc/jSE.kh5mcJqVzq4OhHmikchWqI2N6S9bGGNWMdQl2USQHYK	anurag@gmail.com	client	t	2025-07-02 13:23:02.007282	\N	1118634	1000004	098765678393
51	Rana Singh	$2b$10$vYnX7velOFX9rXTQS0NyH.Er8pT71iFz5c5OfGlbD2QyR43wbfL5i	synchronoussahdev@gmail.com	team	t	2025-07-01 21:13:40.370199	\N	1000003	1000000	87654345678
47	Prabhat Chandra	$2b$10$jggGZKfjiGSX92LNNSEJjunL4.HPvdOuvgQqNLqP0jfienvuS5dWa	alishsahdev.221ee204@nitk.edu.in	admin	t	2025-06-29 07:34:17.636162	\N	1000002	1000000	987678892
61	Sanskar Rai	$2b$10$jYgapKKRnXNltbQoiMUVWu.hlsbQahUhkfKNpH9NSbO4amEd0nVf.	SR00927889@techmahindra.com	client	t	2025-07-03 06:05:36.484052	\N	0927889	1000002	987654323456
57	Priyanka Pol	$2b$10$OzP.68CAXH5c0IPiZ.RIGOFuPerNbcevi8tEJdz1PFcIM4HWVQOqu	priyanka@gmail.com	team	t	2025-07-02 13:20:35.658073	\N	1000004	1000000	9876543211
\.


--
-- Name: access_access_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.access_access_id_seq', 16, true);


--
-- Name: application_application_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.application_application_id_seq', 9, true);


--
-- Name: assigned_tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assigned_tasks_id_seq', 15, true);


--
-- Name: employee_ui_task_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employee_ui_task_id_seq', 20, true);


--
-- Name: offboard_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.offboard_requests_id_seq', 53, true);


--
-- Name: task_table_task_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.task_table_task_id_seq', 16, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 76, true);


--
-- Name: access access_access_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.access
    ADD CONSTRAINT access_access_name_key UNIQUE (access_name);


--
-- Name: access_alarm access_alarm_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.access_alarm
    ADD CONSTRAINT access_alarm_pkey PRIMARY KEY (gid_no, access_id);


--
-- Name: access access_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.access
    ADD CONSTRAINT access_pkey PRIMARY KEY (access_id);


--
-- Name: application_details application_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_details
    ADD CONSTRAINT application_details_pkey PRIMARY KEY (application_id, gid_no);


--
-- Name: application application_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application
    ADD CONSTRAINT application_pkey PRIMARY KEY (application_id);


--
-- Name: assigned_tasks assigned_tasks_gid_no_task_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assigned_tasks
    ADD CONSTRAINT assigned_tasks_gid_no_task_id_key UNIQUE (gid_no, task_id);


--
-- Name: assigned_tasks assigned_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assigned_tasks
    ADD CONSTRAINT assigned_tasks_pkey PRIMARY KEY (id);


--
-- Name: employee_ui employee_ui_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_ui
    ADD CONSTRAINT employee_ui_pkey PRIMARY KEY (task_id);


--
-- Name: employee_ui_steps employee_ui_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_ui_steps
    ADD CONSTRAINT employee_ui_steps_pkey PRIMARY KEY (task_id, step_number);


--
-- Name: offboard_requests offboard_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offboard_requests
    ADD CONSTRAINT offboard_requests_pkey PRIMARY KEY (id);


--
-- Name: task_table task_table_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_table
    ADD CONSTRAINT task_table_pkey PRIMARY KEY (task_id);


--
-- Name: application uq_application_name; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application
    ADD CONSTRAINT uq_application_name UNIQUE (application_name);


--
-- Name: user_access user_access_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_access
    ADD CONSTRAINT user_access_pkey PRIMARY KEY (gid_no, access_id);


--
-- Name: users users_gid_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_gid_no_key UNIQUE (gid_no);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: uq_one_head_per_member; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_one_head_per_member ON public.application_details USING btree (gid_no) WHERE (head_application = true);


--
-- Name: access_alarm access_alarm_access_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.access_alarm
    ADD CONSTRAINT access_alarm_access_id_fkey FOREIGN KEY (access_id) REFERENCES public.access(access_id) ON DELETE CASCADE;


--
-- Name: access_alarm access_alarm_gid_no_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.access_alarm
    ADD CONSTRAINT access_alarm_gid_no_fkey FOREIGN KEY (gid_no) REFERENCES public.users(gid_no) ON DELETE CASCADE;


--
-- Name: application_details application_details_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_details
    ADD CONSTRAINT application_details_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.application(application_id);


--
-- Name: assigned_tasks assigned_tasks_gid_no_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assigned_tasks
    ADD CONSTRAINT assigned_tasks_gid_no_fkey FOREIGN KEY (gid_no) REFERENCES public.users(gid_no) ON DELETE CASCADE;


--
-- Name: assigned_tasks assigned_tasks_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assigned_tasks
    ADD CONSTRAINT assigned_tasks_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.task_table(task_id) ON DELETE CASCADE;


--
-- Name: employee_ui_steps employee_ui_steps_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_ui_steps
    ADD CONSTRAINT employee_ui_steps_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.employee_ui(task_id) ON DELETE CASCADE;


--
-- Name: access fk_access_application; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.access
    ADD CONSTRAINT fk_access_application FOREIGN KEY (application_id) REFERENCES public.application(application_id) ON DELETE CASCADE;


--
-- Name: application_details fk_application_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_details
    ADD CONSTRAINT fk_application_user FOREIGN KEY (gid_no) REFERENCES public.users(gid_no) ON DELETE CASCADE;


--
-- Name: employee_ui fk_employee_ui_app; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_ui
    ADD CONSTRAINT fk_employee_ui_app FOREIGN KEY (application_id) REFERENCES public.application(application_id) ON DELETE CASCADE;


--
-- Name: offboard_requests offboard_requests_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offboard_requests
    ADD CONSTRAINT offboard_requests_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: offboard_requests offboard_requests_decided_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offboard_requests
    ADD CONSTRAINT offboard_requests_decided_by_fkey FOREIGN KEY (decided_by) REFERENCES public.users(user_id);


--
-- Name: user_access user_access_access_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_access
    ADD CONSTRAINT user_access_access_id_fkey FOREIGN KEY (access_id) REFERENCES public.access(access_id);


--
-- Name: user_access user_access_gid_no_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_access
    ADD CONSTRAINT user_access_gid_no_fkey FOREIGN KEY (gid_no) REFERENCES public.users(gid_no) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--
