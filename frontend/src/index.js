import React from 'react'
import ReactDOM from 'react-dom'
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom'

import './style.css'
import Page from './views/page'
import Landing from './views/landing'
import Programms from './views/programms'
import SignIn from './views/sign-in'
import UTMUniversityIndividualPage from './views/universities/utm-university-individual-page'
import Universities from './views/universities'
import USMUniversityIndividualPage from './views/universities/usm-university-individual-page'
import SignUp from './views/sign-up'
import LivingInMoldova from './views/living-in-moldova'
import Error404Page from './views/error404-page'
import NotFound from './views/not-found'

const App = () => {
  return (
    <Router>
      <Switch>
        <Route component={Page} exact path="/page" />
        <Route component={Landing} exact path="/" />
        <Route component={Programms} exact path="/programms" />
        <Route component={SignIn} exact path="/sign-in" />
        <Route
          component={UTMUniversityIndividualPage}
          exact
          path="/universities/usm1"
        />
        <Route component={Universities} exact path="/universities" />
        <Route
          component={USMUniversityIndividualPage}
          exact
          path="/universities/usm"
        />
        <Route component={SignUp} exact path="/sign-up" />
        <Route component={LivingInMoldova} exact path="/living-in-moldova" />
        <Route component={Error404Page} exact path="/error404-page" />
        <Route component={NotFound} path="**" />
        <Redirect to="**" />
      </Switch>
    </Router>
  )
}

ReactDOM.render(<App />, document.getElementById('app'))
