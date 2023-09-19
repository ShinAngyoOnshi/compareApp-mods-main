'use client'
import React from "react";
import LoadingButton from "@/utils/LoadingButton";
import { runProcess } from "./runProcess"
import { findAddedRows, findRemovedRows, importExcel } from "./runProcess";

class ControlledButton extends React.Component {
    constructor(props) {
      super(props);
  
      this.state = { loading: false, finished: false };
    }

    handleButtonClick = async () => {
        this.setState({ loading: true });

        try {
            await runProcess();

            await new Promise((resolve) =>(resolve, 1500))

            this.setState({ finished: true });
        } catch (error) {
            
        } finally {
            this.setState({ loading: false });
        }
    }

    render() {
        const { loading, finished } = this.state;
    
        return (
          <div>
            <LoadingButton
              loading={loading}
              done={finished}
              onClick={this.handleButtonClick}
            >
             testo provvisorio
            </LoadingButton>
          </div>
        );
      }
    }
    
    export default ControlledButton;

