// RLR · Encabezado y menú del sitio · Ricardo López Reyero
// Orden del menú: Escritos · Audios · Descargas · Documentos. Son ligas reales (no botones),
// marcan la página en la que estás y respetan el idioma (/en).
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import EditNoteRounded from '@mui/icons-material/EditNoteRounded';
import HeadphonesRounded from '@mui/icons-material/HeadphonesRounded';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import YouTube from '@mui/icons-material/YouTube';
import { LogoDesktop, LogoMovil } from '../Logo';
import { Btn } from '../Styled';
import './Header.scss';
import ItemSelector from '../ItemSelector';
import { Link, NavLink } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';

// RLR · el menú, en el orden en que se muestra
const SECCIONES = [
  { ruta: '/escritos', texto: 'downloads.escritos.title', Icono: EditNoteRounded },
  { ruta: '/audios', texto: 'header.audios', Icono: HeadphonesRounded },
  { ruta: '/descargas', texto: 'header.download', Icono: FileDownloadOutlined },
  { ruta: '/documentos-importantes', texto: 'downloads.documentos.title', Icono: DescriptionOutlined },
];

const REDES = [
  { nombre: 'YouTube', liga: 'https://www.youtube.com/@RicardoLopezReyero' },
  { nombre: 'TikTok', liga: 'https://www.tiktok.com/@ricardolopezreyero1' },
  { nombre: 'LinkedIn', liga: 'https://www.linkedin.com/in/ricardo-lopez-reyero/' },
];

const IconoRed = ({ nombre, lado }) => {
  if (nombre === 'YouTube') return <YouTube style={{ color: '#585DCC', fontSize: lado + 5 }} />;
  if (nombre === 'TikTok') {
    return (
      <svg width={lado} height={lado} viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M16.8655 6.695C16.182 5.91462 15.8053 4.91243 15.8055 3.875H12.7155V16.275C12.6917 16.946 12.4084 17.5816 11.9253 18.0479C11.4422 18.5143 10.797 18.7749 10.1255 18.775C8.70554 18.775 7.52554 17.615 7.52554 16.175C7.52554 14.455 9.18554 13.165 10.8955 13.695V10.535C7.44554 10.075 4.42554 12.755 4.42554 16.175C4.42554 19.505 7.18554 21.875 10.1155 21.875C13.2555 21.875 15.8055 19.325 15.8055 16.175V9.885C17.0585 10.7849 18.5629 11.2676 20.1055 11.265V8.175C20.1055 8.175 18.2255 8.265 16.8655 6.695Z" fill="#585DCC" />
      </svg>
    );
  }
  return (
    <svg width={lado} height={lado} viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M17.5156 3.75H7.01562C4.94488 3.75 3.26562 5.42925 3.26562 7.5V18C3.26562 20.0707 4.94488 21.75 7.01562 21.75H17.5156C19.5871 21.75 21.2656 20.0707 21.2656 18V7.5C21.2656 5.42925 19.5871 3.75 17.5156 3.75ZM9.26562 18H7.01562V9.75H9.26562V18ZM8.14062 8.799C7.41612 8.799 6.82812 8.2065 6.82812 7.476C6.82812 6.7455 7.41612 6.153 8.14062 6.153C8.86513 6.153 9.45312 6.7455 9.45312 7.476C9.45312 8.2065 8.86588 8.799 8.14062 8.799ZM18.2656 18H16.0156V13.797C16.0156 11.271 13.0156 11.4622 13.0156 13.797V18H10.7656V9.75H13.0156V11.0738C14.0626 9.13425 18.2656 8.991 18.2656 12.9307V18Z" fill="#585DCC" />
    </svg>
  );
};

const Redes = ({ lado }) => (
  <>
    {REDES.map((red) => (
      <a key={red.nombre} href={red.liga} target="_blank" rel="noopener noreferrer" aria-label={red.nombre} title={red.nombre} className="rlr-menu__red">
        <IconoRed nombre={red.nombre} lado={lado} />
      </a>
    ))}
  </>
);

function Header({ footerRef }) {
  const intl = useIntl();
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [currentLang, setCurrentLang] = React.useState('es');

  React.useEffect(() => {
    const currentPath = window.location.pathname;
    setCurrentLang(currentPath.startsWith('/en') ? 'en' : 'es');
  }, []);

  const base = currentLang === 'en' ? '/en' : '';
  const inicio = base || '/';

  const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);

  let logo = require('../../assets/img/Logo.png');
  let logoMovil = require('../../assets/img/isotipo_rlr_sin_fondo.png');

  // Función para hacer scroll hacia el footer
  const scrollToFooter = () => {
    handleCloseNavMenu();
    if (footerRef.current) {
      footerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const liga = (seccion, clase, alPicar) => (
    <NavLink
      key={seccion.ruta}
      to={`${base}${seccion.ruta}`}
      className={({ isActive }) => `${clase}${isActive ? ` ${clase}--activa` : ''}`}
      onClick={alPicar}
    >
      <seccion.Icono className="rlr-menu__icono" aria-hidden="true" />
      <FormattedMessage id={seccion.texto} />
    </NavLink>
  );

  return (
    <AppBar ref={footerRef} position="static" style={{ backgroundColor: '#F6F8FF', padding: '13px 0' }} data-author="RLR">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* ───── Celular ───── */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to={inicio} aria-label={intl.formatMessage({ id: 'header.inicio' })}>
              <LogoMovil src={logoMovil} alt="Ricardo López Reyero" />
            </Link>

            <nav className="rlr-menu rlr-menu--barra" aria-label={intl.formatMessage({ id: 'header.nav' })}>
              {SECCIONES.slice(0, 2).map((seccion) => liga(seccion, 'rlr-menu__liga'))}
            </nav>

            <IconButton
              size="large"
              aria-label={intl.formatMessage({ id: 'header.menu' })}
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              style={{ color: '#4D5FC7' }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              <div className="rlr-menu__panel">
                {SECCIONES.map((seccion) => liga(seccion, 'rlr-menu__fila', handleCloseNavMenu))}
                <div className="rlr-menu__pie">
                  <ItemSelector />
                  <div className="rlr-menu__redes">
                    <Redes lado={28} />
                  </div>
                </div>
                <Btn
                  className="btn"
                  varfontsize="15px"
                  varpadding="12px 24px"
                  varwidth="100%"
                  onClick={scrollToFooter}
                >
                  {currentLang === 'en' ? 'Contact' : 'Contacto'}
                </Btn>
              </div>
            </Menu>
          </Box>

          {/* ───── Escritorio ───── */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Link to={inicio} aria-label={intl.formatMessage({ id: 'header.inicio' })}>
                <LogoDesktop src={logo} alt="Ricardo López Reyero" />
              </Link>
            </Box>

            <nav className="rlr-menu rlr-menu--escritorio" aria-label={intl.formatMessage({ id: 'header.nav' })}>
              {SECCIONES.map((seccion) => liga(seccion, 'rlr-menu__liga'))}
            </nav>

            <Box sx={{ display: { xs: 'none', md: 'flex' } }} style={{ alignItems: 'center' }} className='contacto-grid'>
              <ItemSelector className='display' />

              <Box sx={{ display: { xs: 'none', md: 'flex' } }} className='redes'>
                <Redes lado={25} />
              </Box>

              <Btn
                displaymovil='none'
                className='btn'
                onClick={scrollToFooter}
              >
                {currentLang === 'en' ? 'Contact' : 'Contacto'}
              </Btn>
            </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Header;
