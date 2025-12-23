import { BrowserEnv, BrowserTicker, Karlib, ParticleEmitter } from "../src/main.js";
import type { EmitterConfig } from "../src/main.js";

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export async function main(canvas: HTMLCanvasElement): Promise<void> {

  const kl = new Karlib({
    canvas,
    env: new BrowserEnv(),
  });

  const center_x = CANVAS_WIDTH / 2;
  const center_y = CANVAS_HEIGHT / 2;

  await kl.load_texture("./particle.png", { alias: "particle" });
  await kl.load_texture("./cartoon_smoke.png", { alias: "cartoon_smoke" });
  await kl.load_texture("./hard_rain.png", { alias: "hard_rain" });

  const ticker = new BrowserTicker();

  const config_1: EmitterConfig = {
    "lifetime": {
      "min": 0.2,
      "max": 0.8
    },
    "frequency": 0.001,
    "emitter_lifetime": -1,
    "max_particles": 100,
    "pos": {
      "x": center_x,
      "y": center_y
    },
    "behaviors": [
      {
        "type": "alpha",
        "config": {
          "alpha": {
            "list": [
              {
                "time": 0,
                "value": 0.3
              },
              {
                "time": 1,
                "value": 1
              }
            ]
          }
        }
      },
      {
        "type": "moveSpeed",
        "config": {
          "speed": {
            "list": [
              {
                "time": 0,
                "value": 200
              },
              {
                "time": 1,
                "value": 50
              }
            ]
          },
          "min_mult": 1
        }
      },
      {
        "type": "scale",
        "config": {
          "scale": {
            "list": [
              {
                "time": 0,
                "value": 0.2
              },
              {
                "time": 1,
                "value": 0.01
              }
            ]
          },
          "min_mult": 5
        }
      },
      {
        "type": "color",
        "config": {
          "color": {
            "list": [
              {
                "time": 0,
                "value": "#ece126"
              },
              {
                "time": 1,
                "value": "#f5f5f5"
              }
            ]
          }
        }
      },
      {
        "type": "rotationStatic",
        "config": {
          "min": 90,
          "max": 100
        }
      },
      {
        "type": "textureSingle",
        "config": {
          "texture": "particle"
        }
      },
      {
        "type": "spawnPoint",
        "config": {}
      }
    ]
  };

  const config_2: EmitterConfig = {
    "lifetime": {
      "min": 0.8,
      "max": 0.8
    },
    "particles_per_wave": 8,
    "frequency": 0.2,
    "emitter_lifetime": 0.41,
    "max_particles": 1000,
    "pos": {
      "x": center_x,
      "y": center_y
    },
    "behaviors": [
      {
        "type": "alpha",
        "config": {
          "alpha": {
            "list": [
              {
                "time": 0,
                "value": 0.8
              },
              {
                "time": 1,
                "value": 0.7
              }
            ]
          }
        }
      },
      {
        "type": "moveSpeedStatic",
        "config": {
          "min": 200,
          "max": 200
        }
      },
      {
        "type": "scale",
        "config": {
          "scale": {
            "list": [
              {
                "time": 0,
                "value": 1
              },
              {
                "time": 1,
                "value": 0.3
              }
            ]
          },
          "min_mult": 1
        }
      },
      {
        "type": "color",
        "config": {
          "color": {
            "list": [
              {
                "time": 0,
                "value": "#e3f9ff"
              },
              {
                "time": 1,
                "value": "#0ec8f8"
              }
            ]
          }
        }
      },
      {
        "type": "textureSingle",
        "config": {
          "texture": "particle"
        }
      },
      {
        "type": "spawnBurst",
        "config": {
          "start": 0,
          "spacing": 45,
        }
      }
    ]
  };

  const config_3: EmitterConfig = {
    "blend_mode": "lighter",
    "lifetime": {
      "min": 0.5,
      "max": 0.5
    },
    "particles_per_wave": 10,
    "frequency": 0.1,
    "emitter_lifetime": 0.31,
    "max_particles": 1000,
    "pos": {
      "x": center_x,
      "y": center_y
    },
    "behaviors": [
      {
        "type": "alpha",
        "config": {
          "alpha": {
            "list": [
              {
                "time": 0,
                "value": 0.8
              },
              {
                "time": 1,
                "value": 0.1
              }
            ]
          }
        }
      },
      {
        "type": "moveSpeedStatic",
        "config": {
          "min": 200,
          "max": 200
        }
      },
      {
        "type": "scale",
        "config": {
          "scale": {
            "list": [
              {
                "time": 0,
                "value": 1
              },
              {
                "time": 1,
                "value": 0.3
              }
            ]
          },
          "min_mult": 1
        }
      },
      {
        "type": "color",
        "config": {
          "color": {
            "list": [
              {
                "time": 0,
                "value": "#fd1111"
              },
              {
                "time": 1,
                "value": "#f7a134"
              }
            ]
          }
        }
      },
      {
        "type": "textureSingle",
        "config": {
          "texture": "particle"
        }
      },
      {
        "type": "spawnBurst",
        "config": {
          "start": 0,
          "spacing": 0
        }
      }
    ]
  };

  const config_4: EmitterConfig = {
    "lifetime": {
      "min": 0.4,
      "max": 0.7
    },
    "frequency": 0.001,
    "emitter_lifetime": 0.2,
    "max_particles": 100,
    "pos": {
      "x": center_x,
      "y": center_y
    },
    "behaviors": [
      {
        "type": "alpha",
        "config": {
          "alpha": {
            "list": [
              {
                "time": 0,
                "value": 0.74
              },
              {
                "time": 1,
                "value": 0
              }
            ]
          }
        }
      },
      {
        "type": "moveSpeed",
        "config": {
          "speed": {
            "list": [
              {
                "time": 0,
                "value": 700
              },
              {
                "time": 1,
                "value": 50
              }
            ]
          },
          "min_mult": 1
        }
      },
      {
        "type": "scale",
        "config": {
          "scale": {
            "list": [
              {
                "time": 0,
                "value": 0.1
              },
              {
                "time": 1,
                "value": 1.2
              }
            ]
          },
          "min_mult": 1
        }
      },
      {
        "type": "rotation",
        "config": {
          "accel": 0,
          "min_speed": 0,
          "max_speed": 200,
          "min_start": 0,
          "max_start": 360
        }
      },
      {
        "type": "textureSingle",
        "config": {
          "texture": "cartoon_smoke"
        }
      },
      {
        "type": "spawnPoint",
        "config": {}
      }
    ]
  };

  const config_5: EmitterConfig = {
    "lifetime": {
      "min": 1,
      "max": 1
    },
    "particles_per_wave": 50,
    "frequency": 0.01,
    "emitter_lifetime": 0.5,
    "max_particles": 100,
    "pos": {
      "x": center_x,
      "y": center_y
    },
    "behaviors": [
      {
        "type": "alpha",
        "config": {
          "alpha": {
            "list": [
              {
                "time": 0,
                "value": 1
              },
              {
                "time": 1,
                "value": 0
              }
            ]
          }
        }
      },
      {
        "type": "moveSpeed",
        "config": {
          "speed": {
            "list": [
              {
                "time": 0,
                "value": 500
              },
              {
                "time": 1,
                "value": 200
              }
            ]
          },
          "min_mult": 1
        }
      },
      {
        "type": "scale",
        "config": {
          "scale": {
            "list": [
              {
                "time": 0,
                "value": 1
              },
              {
                "time": 1,
                "value": 0.2
              }
            ]
          },
          "min_mult": 1
        }
      },
      {
        "type": "color",
        "config": {
          "color": {
            "list": [
              {
                "time": 0,
                "value": "#e8f2ff"
              },
              {
                "time": 1,
                "value": "#e6e6e6"
              }
            ]
          }
        }
      },
      {
        "type": "textureSingle",
        "config": {
          "texture": "particle"
        }
      },
      {
        "type": "spawnBurst",
        "config": {
          "start": 0,
          "spacing": 0
        }
      }
    ]
  };

  const config_6: EmitterConfig = {
    "lifetime": {
      "min": 0.5,
      "max": 0.5
    },
    "frequency": 0.008,
    "emitter_lifetime": 0.31,
    "max_particles": 1000,
    "pos": {
      "x": center_x,
      "y": center_y
    },
    "behaviors": [
      {
        "type": "alpha",
        "config": {
          "alpha": {
            "list": [
              {
                "time": 0,
                "value": 0.8
              },
              {
                "time": 1,
                "value": 0.1
              }
            ]
          }
        }
      },
      {
        "type": "moveSpeed",
        "config": {
          "speed": {
            "list": [
              {
                "time": 0,
                "value": 200
              },
              {
                "time": 1,
                "value": 100
              }
            ]
          },
          "min_mult": 1
        }
      },
      {
        "type": "scale",
        "config": {
          "scale": {
            "list": [
              {
                "time": 0,
                "value": 1
              },
              {
                "time": 1,
                "value": 0.3
              }
            ]
          },
          "min_mult": 1
        }
      },
      {
        "type": "color",
        "config": {
          "color": {
            "list": [
              {
                "time": 0,
                "value": "#fb1010"
              },
              {
                "time": 1,
                "value": "#f5b830"
              }
            ]
          }
        }
      },
      {
        "type": "rotationStatic",
        "config": {
          "min": 0,
          "max": 360
        }
      },
      {
        "type": "textureSingle",
        "config": {
          "texture": "particle"
        }
      },
      {
        "type": "spawnShape",
        "config": {
          "type": "torus",
          "data": {
            "x": 0,
            "y": 0,
            "radius": 10,
            "inner_radius": 0,
            "affect_rotation": false
          }
        }
      }
    ]
  };

  const config_7: EmitterConfig = {
    "lifetime": {
      "min": 0.81,
      "max": 0.81
    },
    "frequency": 0.004,
    "emitter_lifetime": -1,
    "max_particles": 1000,
    "pos": {
      "x": 0,
      "y": 0
    },
    "behaviors": [
      {
        "type": "alphaStatic",
        "config": {
          "alpha": 0.5
        }
      },
      {
        "type": "moveSpeedStatic",
        "config": {
          "min": 3000,
          "max": 3000
        }
      },
      {
        "type": "scaleStatic",
        "config": {
          "min": 1,
          "max": 1
        }
      },
      {
        "type": "colorStatic",
        "config": {
          "color": "#ffffff"
        }
      },
      {
        "type": "rotationStatic",
        "config": {
          "min": 65,
          "max": 65
        }
      },
      {
        "type": "textureSingle",
        "config": {
          "texture": "hard_rain"
        }
      },
      {
        "type": "spawnShape",
        "config": {
          "type": "rect",
          "data": {
            "x": 0,
            "y": 0,
            "w": 900,
            "h": 20
          }
        }
      }
    ]
  };

  const configs: EmitterConfig[] = [config_1, config_2, config_3, config_4, config_5, config_6, config_7];
  let current_index = 0;

  let emitter: ParticleEmitter | undefined = new ParticleEmitter(kl, configs[current_index]);
  emitter.set_on_animation_complete(() => {
    console.log("emitter animation complete!");
  });

  ticker.on_tick(({ delta_time }) => {
    kl.clear_background("#000");

    emitter?.update(delta_time);
    emitter?.draw();
  });

  canvas.addEventListener("pointerdown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left);
    const y = (e.clientY - rect.top);
    emitter?.update_spawn_pos(x, y);
  });

  let emit: boolean = true;
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      emit = !emit;
      emitter?.set_emit(emit);
      return;
    }

    if (e.code === "ArrowLeft" || e.code === "ArrowRight") {
      // change emitter config
      if (e.code === "ArrowRight") {
        current_index = (current_index + 1) % configs.length;
      } else if (e.code === "ArrowLeft") {
        current_index = (current_index - 1 + configs.length) % configs.length;
      }

      // recreate emitter
      if (emitter) {
        emitter.dispose();
        emitter = undefined;
      }
      emitter = new ParticleEmitter(kl, configs[current_index]);
      emitter.set_on_animation_complete(() => {
        console.log("emitter animation complete!");
      });
      emitter.set_emit(emit);
      console.log(`Switched to emitter config ${current_index + 1}`);
    }
  });

  // append help
  const help_text = document.createElement("p");
  help_text.style.textAlign = "center";
  help_text.innerText = "Use right/left arrow keys to toggle between particle examples!";

  document.body.appendChild(help_text);
}
