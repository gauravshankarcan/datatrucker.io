/*
* Copyright 2021 Datatrucker.io Inc , Ontario , Canada
* 
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
* 
*     http://www.apache.org/licenses/LICENSE-2.0
* 
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/ 

import React from 'react';
import clsx from 'clsx';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Collapse from '@material-ui/core/Collapse';
import Link from '@material-ui/core/Link';
import Button from '@material-ui/core/Button';

//Import children
import MainRouter from './MainRouter';

//ICONs
import PersonIcon from '@material-ui/icons/Person';
import GroupIcon from '@material-ui/icons/Group';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import StorageRoundedIcon from '@material-ui/icons/StorageRounded';
import OpenInBrowserRoundedIcon from '@material-ui/icons/OpenInBrowserRounded';
import VpnKeyRoundedIcon from '@material-ui/icons/VpnKeyRounded';
import FileCopyRoundedIcon from '@material-ui/icons/FileCopyRounded';
import CloudCircleOutlinedIcon from '@material-ui/icons/CloudCircleOutlined';
import EmojiObjectsOutlinedIcon from '@material-ui/icons/EmojiObjectsOutlined';
import AllInclusiveOutlinedIcon from '@material-ui/icons/AllInclusiveOutlined';

const iconlist = {
      PersonIcon: PersonIcon,
      GroupIcon: GroupIcon,
      AccountTreeIcon: AccountTreeIcon,
      StorageRoundedIcon: StorageRoundedIcon,
      OpenInBrowserRoundedIcon: OpenInBrowserRoundedIcon,
      VpnKeyRoundedIcon: VpnKeyRoundedIcon,
      FileCopyRoundedIcon: FileCopyRoundedIcon,
      CloudCircleOutlinedIcon: CloudCircleOutlinedIcon,
      EmojiObjectsOutlinedIcon: EmojiObjectsOutlinedIcon,
      DeveloperModeOutlinedIcon: AccountTreeIcon,
      AllInclusiveOutlinedIcon: AllInclusiveOutlinedIcon
};
const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
      root: {
            display: 'flex'
      },
      bottomAppBar: {
            top: 'auto',
            bottom: 0,
            textAlign: 'center',
            fontSize: '10px'
      },
      appBar: {
            zIndex: theme.zIndex.drawer + 1,
            transition: theme.transitions.create(['width', 'margin'], {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.leavingScreen
            })
      },
      appBarShift: {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen
            })
      },
      menuButton: {
            marginRight: 36
      },
      hide: {
            display: 'none'
      },
      drawer: {
            width: drawerWidth,
            flexShrink: 0,
            whiteSpace: 'nowrap',
            height: '100vh'
      },
      drawerOpen: {
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen
            })
      },
      drawerClose: {
            transition: theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.leavingScreen
            }),
            overflowX: 'hidden',
            width: 0,
            [theme.breakpoints.up('sm')]: {
                  width: 0
            }
      },
      toolbar: {
            color: '#fff',
            backgroundColor: '#4caf50',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: theme.spacing(0, 1),
            // necessary for content to be below app bar
            ...theme.mixins.toolbar
      },
      content: {
            flexGrow: 1,
            padding: theme.spacing(3)
      },
      title: {
            flexGrow: 1
      },
      button: {
            float: 'right'
      },
      card: {
            display: 'inline-block',
            margin: '10px',
            marginTop: '75px',
            width: '100%',
            minHeight: '100%'
      },
      nested: {
            paddingLeft: theme.spacing(4)
      },
      link: {
            color: '#000'
      }
}));

export default function HeaderSidebarFooter() {
      const classes = useStyles();
      const theme = useTheme();
      const [open, setOpen] = React.useState(false);
      const [expandPanel, setExpandPanel] = React.useState({
            Users: false
      });
      const defaultPanel = {
            Login: {
                  Login: {redirect: '/login'},
                  OPTIONS: {
                        ico: 'PersonIcon',
                        RunAccess: true
                  }
            }
      }
      const [panelData, setPanelData] = React.useState(defaultPanel);

      const handleDrawerOpen = () => {
            setOpen(true);
      };

      const handleDrawerClose = () => {
            setOpen(false);
            var newExapndPanel = {};
            Object.entries(expandPanel).forEach(([key, value]) => {
                  newExapndPanel[key] = false;
            });
            setExpandPanel(newExapndPanel);
            return null;
      };

      const handleClick = (key) => {
            if (open === true) {
                  setExpandPanel({...expandPanel, [key]: !expandPanel[key]});
            }
      };

      const populatePanel = () => {
            if (typeof panelData.Login !== 'undefined') {
                  const apiUrl = '/api/v1/ui/resource-panels';
                  fetch(apiUrl)
                        .then((response) => response.json())
                        .then((data) => {
                              if (data.status) {
                                    var expandablePanels = {};
                                    Object.entries(data.Panels).forEach(([key, value]) => {
                                          expandablePanels[key] = false;
                                    });
                                    setExpandPanel(expandablePanels);
                                    setPanelData(data.Panels);
                              }
                        });
            }
      };
      populatePanel();

      return (
            <div className={classes.root}>
                  <CssBaseline />
                  <AppBar
                        position="fixed"
                        className={clsx(classes.appBar, {
                              [classes.appBarShift]: open
                        })}
                  >
                        <Toolbar>
                              <IconButton
                                    color="inherit"
                                    aria-label="open drawer"
                                    onClick={handleDrawerOpen}
                                    edge="start"
                                    className={clsx(classes.menuButton, {
                                          [classes.hide]: open
                                    })}
                              >
                                    <MenuIcon />
                              </IconButton>
                              <Typography variant="h6" noWrap className={classes.title}>
                                    <Link href="/Home" color="inherit">   
                                          Data Trucker
                                    </Link>
                              </Typography>                            
                        </Toolbar>
                  </AppBar>
                  <Drawer
                        color={theme.primary}
                        variant="permanent"
                        className={clsx(classes.drawer, {
                              [classes.drawerOpen]: open,
                              [classes.drawerClose]: !open
                        })}
                        classes={{
                              paper: clsx({
                                    [classes.drawerOpen]: open,
                                    [classes.drawerClose]: !open
                              })
                        }}
                  >
                        <div className={classes.toolbar}>
                              Navigation
                              <IconButton onClick={handleDrawerClose}>{theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}</IconButton>
                        </div>
                        <Divider />
                        <List>
                              {Object.entries(panelData).map(([key, value]) => {
                                    const IcoComponent = iconlist[value.OPTIONS.ico];
                                    return (
                                          <React.Fragment key={key}>
                                                <ListItem
                                                      button
                                                      key={key}
                                                      onClick={(e) => {
                                                            handleClick(key);
                                                            handleDrawerOpen();
                                                      }}
                                                >
                                                      <ListItemIcon>
                                                            <IcoComponent />
                                                      </ListItemIcon>
                                                      <ListItemText primary={key} />
                                                      {expandPanel[key] ? <ExpandLess /> : <ExpandMore />}
                                                </ListItem>
                                                <Collapse in={expandPanel[key]} timeout="auto" unmountOnExit>
                                                      <List component="div" disablePadding>
                                                            {Object.entries(value).map(([keyinner, valueinner]) => {
                                                                  if (keyinner !== 'OPTIONS') {
                                                                        return (
                                                                              <a href={valueinner.redirect} className={classes.link} key={keyinner}>
                                                                                    <ListItem button className={classes.nested}>
                                                                                          <ListItemText primary={keyinner}></ListItemText>
                                                                                    </ListItem>
                                                                              </a>
                                                                        );
                                                                  } else {
                                                                        return null;
                                                                  }
                                                            })}
                                                      </List>
                                                </Collapse>
                                          </React.Fragment>
                                    );
                              })}
                        </List>
                        <Divider />
                        <Button color="inherit">
                              <Link href="/Login" color="inherit">  
                                 Logout
                              </Link>
                        </Button>
                  </Drawer>
                  <Card className={classes.card}>
                        <CardContent>
                              <main className={classes.content}>
                                    <div>
                                          <MainRouter />
                                    </div>
                              </main>
                        </CardContent>
                  </Card>
            </div>
      );
}
